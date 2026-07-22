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
}