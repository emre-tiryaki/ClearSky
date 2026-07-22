import type { FlightPosition } from "../../../../shared/index.js";

export class LiveFlightStore {
    private readonly flights = new Map<string, FlightPosition>()

    set(position: FlightPosition): void {
        this.flights.set(position.icao24, position);
    }

    get(icao24: string): FlightPosition | undefined {
        return this.flights.get(icao24);
    }
}