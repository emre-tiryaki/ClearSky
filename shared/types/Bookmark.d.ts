// Minimal bookmark document type stored in MongoDB `bookmarks` collection.
// A bookmark is just a reference to an aircraft for quick access - not a position snapshot.
export interface BookmarkDocument {
    icao24: string;
    callsign: string | null;
    category: number;
    createdAt: Date;
}

// A BookmarkDocument that has been persisted and assigned a MongoDB `_id`.
export interface SavedBookmark extends BookmarkDocument {
    _id: string;
}