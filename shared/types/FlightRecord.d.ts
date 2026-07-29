// Raw document shape stored in the MongoDB `flight_records` collection.
export interface FlightRecordDocument {
    icao24: string;
    callsign: string | null;
    position: {
        lat: number;
        lon: number;
    };
    altitude: number | null;
    velocity: number | null;
    heading: number | null;
    verticalRate: number | null;
    onGround: boolean;
    recordedAt: Date;
    savedAt: Date;
    note: string | null;
    category: number;
}

// A FlightRecordDocument that has been persisted and assigned a MongoDB `_id`.
export interface SavedFlightRecord extends FlightRecordDocument {
    _id: string;
}