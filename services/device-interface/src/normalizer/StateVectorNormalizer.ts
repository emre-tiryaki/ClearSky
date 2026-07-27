import type { FlightPosition } from "../../../../shared/index.js";
import type { RawStateVector } from "../opensky/types.js";

// Converts raw OpenSky state vectors into the shared FlightPosition shape.
export class StateVectorNormalizer {
    // Keeps only vectors with usable coordinates and maps them to flight positions.
    normalize(raw: RawStateVector[]): FlightPosition[] {
        return raw
            .filter((vector): vector is RawStateVector & { longitude: number; latitude: number } =>
                vector.longitude !== null && vector.latitude !== null)
            .map(vector => this.mapFields(vector));
    }

    // Translates a single state vector into the normalized flight position model.
    mapFields(vector: RawStateVector & { longitude: number; latitude: number; }): FlightPosition {
        return {
            icao24: vector.icao24,
            callsign: vector.callsign,
            longitude: vector.longitude,
            latitude: vector.latitude,
            altitude: vector.baro_altitude,
            speed: vector.velocity,
            heading: vector.true_track,
            onGround: vector.on_ground,
            verticalRate: vector.vertical_rate,
            timestamp: new Date(),
            category: vector.category,
        }
    }
}