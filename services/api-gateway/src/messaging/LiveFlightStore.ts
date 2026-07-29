import type { FlightPosition } from "../../../../shared/index.js";

// In-memory store that keeps the latest position for each aircraft, keyed by icao24.
export class LiveFlightStore {
    private readonly flights = new Map<string, FlightPosition>()

    set(position: FlightPosition): void {
        this.flights.set(position.icao24, position);
    }

    get(icao24: string): FlightPosition | undefined {
        return this.flights.get(icao24);
    }
}