export interface Bookmark {
    id: string;
    icao24: string;
    callsign: string | null;
    category: number;
    createdAt: string;
}