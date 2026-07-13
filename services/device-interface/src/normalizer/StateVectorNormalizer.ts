import type { FlightPosition } from "../../../../shared/index.js";
import type { RawStateVector } from "../opensky/types.js";

export class StateVectorNormalizer {
    normalize(raw: RawStateVector[]): FlightPosition[] {
        return raw
            .filter((vector): vector is RawStateVector & { longitude: number; latitude: number } =>
                vector.longitude !== null && vector.latitude !== null)
            .map(vector => this.mapFields(vector));
    }

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
        }
    }
}