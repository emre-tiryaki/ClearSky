import type { FlightPosition, BoundingBox } from "../../../../shared/index.js";

// Aircraft entries older than this threshold are pruned from the store.
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// In-memory store that keeps the latest positions for each aircraft, keyed by icao24.
export class LiveFlightStore {
    private readonly flights = new Map<string, FlightPosition[]>()
    private readonly lastUpdated = new Map<string, number>();

    set(position: FlightPosition): void {
        const history = this.flights.get(position.icao24) ?? [];
        history.push(position);

        if (history.length > 3) {
            history.shift(); // Sadece güncel + 2 geçmiş (toplam 3) veriyi tut
        }
        this.flights.set(position.icao24, history);
        this.lastUpdated.set(position.icao24, Date.now());
    }

    get(icao24: string): FlightPosition | undefined {
        const history = this.flights.get(icao24);
        return history ? history[history.length - 1] : undefined;
    }

    // Removes aircraft that have not reported a position within STALE_THRESHOLD_MS.
    // Should be called periodically (e.g. every minute) to prevent unbounded growth.
    prune(): number {
        const cutoff = Date.now() - STALE_THRESHOLD_MS;
        let removed = 0;
        for (const [icao24, ts] of this.lastUpdated) {
            if (ts < cutoff) {
                this.flights.delete(icao24);
                this.lastUpdated.delete(icao24);
                removed++;
            }
        }
        return removed;
    }

    // Returns the flights in the bounding box with their history.
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