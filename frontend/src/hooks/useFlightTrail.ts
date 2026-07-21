import { useEffect, useRef, useState } from "react";
import type { FlightPosition } from "../types/fligt";
import type { TrailPoint } from "../types/trail";

const MAX_TRAIL_POINTS = 50;

export function useFlightTrail(
    flights: Map<string, FlightPosition>
): Map<string, TrailPoint[]> {
    const [trails, setTrails] = useState<Map<string, TrailPoint[]>>(new Map());
    const lastTimestampRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        setTrails(prev => {
            let changed = false;
            const next = new Map(prev);

            for (const [icao24, position] of flights) {
                if (lastTimestampRef.current.get(icao24) === position.timestamp) continue;

                lastTimestampRef.current.set(icao24, position.timestamp);
                const point: TrailPoint = {
                    lat: position.latitude,
                    lon: position.longitude,
                    speed: position.speed,
                    timestamp: position.timestamp,
                };

                const updated = [...(next.get(icao24) ?? []), point].slice(-MAX_TRAIL_POINTS);
                next.set(icao24, updated);
                changed = true;
            }

            for (const icao24 of next.keys()) {
                if (!flights.has(icao24)) {
                    next.delete(icao24);
                    lastTimestampRef.current.delete(icao24);
                    changed = true;
                }
            }

            return changed ? next : prev;
        });
    }, [flights])

    return trails;
}