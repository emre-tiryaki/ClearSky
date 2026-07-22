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
}

export interface SavedFlightRecord extends FlightRecordDocument {
    _id: string;
}