import { Collection, Db } from "mongodb";
import type { FlightPosition, FlightRecordDocument, SavedFlightRecord } from "../../../../shared/index.js";

const COLLECTION_NAME = 'flight_records'

export class FlightRepository {
    private readonly collection: Collection<FlightRecordDocument>;

    constructor(db: Db) {
        this.collection = db.collection<FlightRecordDocument>(COLLECTION_NAME);
    }

    async save(position: FlightPosition, note?: string): Promise<SavedFlightRecord> {
        const document: FlightRecordDocument = {
            icao24: position.icao24,
            callsign: position.callsign,
            position: {
                lat: position.latitude,
                lon: position.longitude
            },
            altitude: position.altitude,
            velocity: position.speed,
            heading: position.heading,
            verticalRate: position.verticalRate,
            onGround: position.onGround,
            recordedAt: position.timestamp,
            savedAt: new Date(),
            note: note ?? null,
        };

        const result = await this.collection.insertOne(document);
        return { ...document, _id: result.insertedId.toString() };
    }
}