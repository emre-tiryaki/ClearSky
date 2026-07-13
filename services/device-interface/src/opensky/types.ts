// Fetching option type: these options are for specifying the fetching request
export interface FetchStatesOptions {
    //The time in Unix time stamp to retrieve states for. Current time will be used if omitted.
    time?: number;

    //One or more ICAO24 transponder addresses represented by a hex string (e.g. abc9f3). 
    // To filter multiple ICAO24 append the property once for each address. 
    // If omitted, the state vectors of all aircraft are returned.
    icao24?: string[];
}

export interface RawStateVector {
    icao24: string;

    callsign: string | null;
    longitude: number | null;
    latitude: number | null;
    baro_altitude: number | null;
    on_ground: boolean;
    velocity: number | null;
    true_track: number | null;
    vertical_rate: number | null;
}

// response from the API
export interface OpenSkyStatesResponse {
    // The time which the state vectors in this response are associated with. 
    // All vectors represent the state of a vehicle with the interval [𝑡⁢𝑖⁢𝑚⁢𝑒 −1,𝑡⁢𝑖⁢𝑚⁢𝑒].
    time: number;

    // The state vectors.
    states: OpenSkyStateVectorRaw[] | null;
}

// Raw state response type
export type OpenSkyStateVectorRaw = [
    // 0: icao24 - Unique ICAO 24-bit address of the transponder in hex string representation.
    string,
    // 1: callsign - Callsign of the aircraft.
    string | null,
    // 2: origin_country - Country name inferred from the ICAO 24-bit address.
    string,
    // 3: time_position - Unix timestamp of the last position update.
    number | null,
    // 4: last_contact - Unix timestamp of the last message received from the transponder.
    number | null,
    // 5: longitude - WGS-84 longitude in decimal degrees.
    number | null,
    // 6: latitude - WGS-84 latitude in decimal degrees.
    number | null,
    // 7: baro_altitude - Barometric altitude in meters.
    number | null,
    // 8: on_ground - Indicates whether the aircraft is on the ground.
    boolean,
    // 9: velocity - Velocity over ground in m/s.
    number | null,
    // 10: true_track - True track in decimal degrees clockwise from north.
    number | null,
    // 11: vertical_rate - Vertical rate in m/s. Positive values indicate climbing, negative values descending.
    number | null,
    // 12: sensors - IDs of receivers that contributed to this state vector.
    number[] | null,
    // 13: geo_altitude - Geometric altitude in meters.
    number | null,
    // 14: squawk - Transponder code aka squawk.
    string | null,
    // 15: spi - Indicates whether the flight status is special purpose indicator.
    boolean,
    // 16: position_source - Source of the aircraft position, for example ADS-B or MLAT.
    number,
    // 17: category - Aircraft category code.
    number,
];