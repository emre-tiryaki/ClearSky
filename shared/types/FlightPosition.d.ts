// Aircraft object
export interface FlightPosition {
    // Unique ICAO 24-bit address of the transponder in hex string representation.
    icao24: string;

    // Callsign of the vehicle (8 chars). Can be null if no callsign has been received.
    callsign: string | null;

    // WGS-84 longitude in decimal degrees.
    longitude: number;

    // WGS-84 latitude in decimal degrees.
    latitude: number;

    // Barometric altitude in meters.
    altitude: number | null;

    // Velocity over ground in m/s. 
    speed: number | null;

    // True track in decimal degrees clockwise from north (north=0°).
    heading: number | null;

    // Boolean value which indicates if the position was retrieved from a surface position report.
    onGround: boolean;

    // Vertical rate in m/s. 
    // A positive value indicates that the airplane is climbing, a negative value indicates that it descends.
    verticalRate: number | null;

    // Unix timestamp of the retrieved state.
    timestamp: Date;
}