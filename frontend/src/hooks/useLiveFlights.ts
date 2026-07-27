import { useEffect, useState } from "react";
import { getGraphQlWsClient } from "../graphql/client";
import { LIVE_FLIGHTS_SUBSCRIPTION } from "../graphql/subscriptions";
import type { BoundingBox, FlightPosition } from "../types/fligt";

const STALE_THRESHOLD_MS = 60_000;
const PRUNE_INTERVAL_MS = 10_000;

interface TrackedFlight {
    position: FlightPosition;
    lastSeen: number;
}

export function useLiveFlights(bbox: BoundingBox): Map<string, FlightPosition> {
    const { lamin, lomin, lamax, lomax } = bbox;
    
    const [tracked, setTracked] = useState<Map<string, TrackedFlight>>(new Map());
    
    useEffect(() => {
        const client = getGraphQlWsClient();
        const currentBbox: BoundingBox = { lamin, lomin, lamax, lomax };

        const unsubscribe = client.subscribe<{ liveFlights: FlightPosition }>(
            { query: LIVE_FLIGHTS_SUBSCRIPTION, variables: { bbox: currentBbox } },
            {
                next: ({ data }) => {
                    const position = data?.liveFlights;
                    if (!position) return;

                    setTracked(prev => {
                        const next = new Map(prev);
                        next.set(position.icao24, { position, lastSeen: Date.now() });
                        return next;
                    });
                },
                error: err => console.error("liveFlights subscription hatasi", err),
                complete: () => console.warn("liveFlights subscription tamamlandi"),
            },
        );

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
            clearInterval(pruneTimer);
        };
    }, [lamin, lomin, lamax, lomax]);

    // Hook'un disina sadece FlightPosition sizdiriliyor; lastSeen tamamen
    // ic detay, tuketen tarafin bilmesine gerek yok.
    const flights = new Map<string, FlightPosition>();
    for (const [icao24, entry] of tracked) {
        flights.set(icao24, entry.position);
    }
    return flights;
}