import { useEffect, useState } from "react";
import { getGraphQlWsClient } from "../graphql/client";
import { LIVE_FLIGHTS_SUBSCRIPTION } from "../graphql/subscriptions";
import type { BoundingBox, FlightPosition } from "../types/flight";

const STALE_THRESHOLD_MS = 60_000;
const PRUNE_INTERVAL_MS = 10_000;

interface TrackedFlight {
    position: FlightPosition;
    lastSeen: number;
}

// Subscribes to real-time flight positions via GraphQL WebSocket and returns
// a Map of currently visible aircraft. Entries unseen for STALE_THRESHOLD_MS
// are pruned every PRUNE_INTERVAL_MS to remove disappeared flights.
export function useLiveFlights(bbox: BoundingBox): Map<string, FlightPosition> {
    const { lamin, lomin, lamax, lomax } = bbox;
    
    const [tracked, setTracked] = useState<Map<string, TrackedFlight>>(new Map());
    
    useEffect(() => {
        const client = getGraphQlWsClient();
        const currentBbox: BoundingBox = { lamin, lomin, lamax, lomax };
        
        // Buffer for incoming flights
        let buffer: FlightPosition[] = [];

        const unsubscribe = client.subscribe<{ liveFlights: FlightPosition }>(
            { query: LIVE_FLIGHTS_SUBSCRIPTION, variables: { bbox: currentBbox } },
            {
                next: ({ data }) => {
                    const position = data?.liveFlights;
                    if (position) buffer.push(position);
                },
                error: err => console.error("liveFlights subscription hatasi", err),
                complete: () => console.warn("liveFlights subscription tamamlandi"),
            },
        );

        // Batch update state every 500ms
        const flushTimer = setInterval(() => {
            if (buffer.length === 0) return;
            
            const batch = buffer;
            buffer = []; // clear buffer

            setTracked(prev => {
                const next = new Map(prev);
                const now = Date.now();
                for (const position of batch) {
                    next.set(position.icao24, { position, lastSeen: now });
                }
                return next;
            });
        }, 500);

        const pruneTimer = setInterval(() => {
            const now = Date.now();

            setTracked(prev => {
                let changed = false;
                const next = new Map(prev);

                for (const [icao24, entry] of prev.entries()) {
                    if (now - entry.lastSeen > STALE_THRESHOLD_MS) {
                        next.delete(icao24);
                        changed = true;
                    }
                }

                return changed ? next : prev;
            });
        }, PRUNE_INTERVAL_MS);

        return () => {
            unsubscribe();
            clearInterval(flushTimer);
            clearInterval(pruneTimer);
        };
    }, [lamin, lomin, lamax, lomax]);

    // Only FlightPosition is exposed outside the hook; lastSeen is an
    // internal detail that consumers don't need to know about.
    const flights = new Map<string, FlightPosition>();
    for (const [icao24, entry] of tracked) {
        flights.set(icao24, entry.position);
    }
    return flights;
}