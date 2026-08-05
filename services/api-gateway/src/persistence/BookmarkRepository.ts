import type { Collection, Db } from "mongodb";
import type { BookmarkDocument, SavedBookmark } from "../../../../shared/index.js";

const COLLECTION_NAME = "bookmarks";

// Data access layer for the `bookmarks` collection in the mongodb
export class BookmarkRepository {
    private readonly collection: Collection<BookmarkDocument>;

    constructor(db: Db) {
        this.collection = db.collection<BookmarkDocument>(COLLECTION_NAME);
        void this.collection.createIndex({ icao24: 1 }, { unique: true });
    }

    // Inserts or updates a bookmark for the given aircraft
    async save(icao24: string, callsign: string | null, category: number): Promise<SavedBookmark> {
        const now = new Date();
        await this.collection.updateOne(
            { icao24 },
            {
                $setOnInsert: { createdAt: now },
                $set: { callsign, category },
            },
            { upsert: true },
        );

        const doc = await this.collection.findOne({ icao24 });
        if (!doc)
            throw new Error(`BookmarkRepository: failed to retrieve bookmark for ${icao24}`);

        return { ...doc, _id: doc._id.toString() };
    }

    // Removes the bookmark for the given aircraft. Returns true if the document is deleted
    async remove(icao24: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ icao24 });
        return result.deletedCount === 1;
    }

    // Returns all bookmarks ordered by creation time.
    async findAll(): Promise<SavedBookmark[]> {
        const docs = await this.collection.find().sort({ createdAt: 1 }).toArray();
        return docs.map(doc => ({ ...doc, _id: doc._id.toString() }));
    }
}