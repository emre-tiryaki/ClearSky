export interface FlightPosition {
    icao24: string;
    callsign: string | null;
    longitude: number;
    latitude: number;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
    onGround: boolean;
    verticalRate: number | null;
    timestamp: string;
    category: number;
}

export interface BoundingBox {
    lamin: number;
    lomin: number;
    lamax: number;
    lomax: number;
}