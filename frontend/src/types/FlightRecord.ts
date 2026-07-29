// Client-side flight record shape matching the GraphQL FlightRecord type.
export interface FlightRecord {
    id: string;
    icao24: string;
    callsign: string | null;
    latitude: number;
    longitude: number;
    altitude: number | null;
    velocity: number | null;
    heading: number | null;
    verticalRate: number | null;
    onGround: boolean;
    recordedAt: string;
    savedAt: string;
    note: string | null;
    category: number;
}