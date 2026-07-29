import type { FlightPosition, BoundingBox } from "../../../../shared/index.js";

// In-memory store that keeps the latest positions for each aircraft, keyed by icao24.
export class LiveFlightStore {
    private readonly flights = new Map<string, FlightPosition[]>()

    set(position: FlightPosition): void {
        const history = this.flights.get(position.icao24) ?? [];
        history.push(position);
        
        if (history.length > 3) {
            history.shift(); // Sadece güncel + 2 geçmiş (toplam 3) veriyi tut
        }
        this.flights.set(position.icao24, history);
    }

    get(icao24: string): FlightPosition | undefined {
        const history = this.flights.get(icao24);
        return history ? history[history.length - 1] : undefined;
    }

    // Returns the flights in the bounding box wit their history.
    getInBboxWithHistory(bbox: BoundingBox): FlightPosition[] {
        const result: FlightPosition[] = [];
        for (const history of this.flights.values()) {
            const latest = history[history.length - 1];
            if (
                latest &&
                latest.latitude >= bbox.lamin && latest.latitude <= bbox.lamax &&
                latest.longitude >= bbox.lomin && latest.longitude <= bbox.lomax
            ) {
                result.push(...history);
            }
        }
        return result;
    }
}