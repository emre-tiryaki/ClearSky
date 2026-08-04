import { useEffect, useMemo, useState } from "react";
import { getGraphQlWsClient } from "../graphql/client";
import { LIVE_FLIGHTS_SUBSCRIPTION } from "../graphql/subscriptions";
import type { BoundingBox, FlightPosition } from "../types/flight";
import type { TrailPoint } from "../types/trail";

const STALE_THRESHOLD_MS = 60_000;
const PRUNE_INTERVAL_MS = 10_000;
const MAX_TRAIL_POINTS = 50;

interface TrackedFlight {
    position: FlightPosition;
    trail: TrailPoint[];
    lastSeen: number;
}

export function useLiveFlights(bbox: BoundingBox): {
    flights: Map<string, FlightPosition>;
    trails: Map<string, TrailPoint[]>;
} {
    const { lamin, lomin, lamax, lomax } = bbox;
    const [tracked, setTracked] = useState<Map<string, TrackedFlight>>(new Map());

    useEffect(() => {
        const client = getGraphQlWsClient();
        const currentBbox: BoundingBox = { lamin, lomin, lamax, lomax };
        let buffer: FlightPosition[] = [];

        const unsubscribe = client.subscribe<{ liveFlights: FlightPosition }>(
            { query: LIVE_FLIGHTS_SUBSCRIPTION, variables: { bbox: currentBbox } },
            {
                next: ({ data }) => {
                    if (data?.liveFlights) buffer.push(data.liveFlights);
                },
                error: err => console.error("liveFlights hatasi", err),
                complete: () => console.warn("liveFlights tamamlandi"),
            },
        );

        const flushTimer = setInterval(() => {
            if (buffer.length === 0) return;
            const batch = buffer;
            buffer = [];

            setTracked(prev => {
                const next = new Map(prev);
                const now = Date.now();
                
                const grouped = new Map<string, FlightPosition[]>();
                for (const pos of batch) {
                    if (!grouped.has(pos.icao24)) grouped.set(pos.icao24, []);
                    grouped.get(pos.icao24)!.push(pos);
                }

                for (const [icao24, positions] of grouped) {
                    const latest = positions[positions.length - 1];
                    const existing = next.get(icao24);
                    
                    const newTrailPoints = positions.map(p => ({
                        lat: p.latitude,
                        lon: p.longitude,
                        speed: p.speed,
                        timestamp: p.timestamp
                    }));

                    let finalTrail = existing ? existing.trail.concat(newTrailPoints) : newTrailPoints;
                    if (finalTrail.length > MAX_TRAIL_POINTS) {
                        finalTrail = finalTrail.slice(-MAX_TRAIL_POINTS);
                    }

                    next.set(icao24, { position: latest, trail: finalTrail, lastSeen: now });
                }
                return next;
            });
        }, 1500);

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

    return useMemo(() => {
        const flights = new Map<string, FlightPosition>();
        const trails = new Map<string, TrailPoint[]>();
        for (const [icao24, entry] of tracked) {
            flights.set(icao24, entry.position);
            trails.set(icao24, entry.trail);
        }
        return { flights, trails };
    }, [tracked]);
}