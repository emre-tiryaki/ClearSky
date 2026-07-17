import { useEffect, useRef, useState } from "react";
import type { FlightPosition } from "../types/FlightPosition";
import { getGraphQlWsClient } from "../graphql/client";
import { LIVE_FLIGHTS_SUBSCRIPTION } from "../graphql/queries";

// If an aircraft hasn't been updated for this long, drop it from the map.
const STALE_THRESHOLD_MS = 60_000;
const PRUNE_INTERVAL_MS = 10_000;

export function useLiveFlights(): Map<string, FlightPosition> {
  const [flights, setFlights] = useState<Map<string, FlightPosition>>(new Map());
  const lastSeenRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const client = getGraphQlWsClient();

    const unsubscribe = client.subscribe<{ liveFlights: FlightPosition }>(
      { query: LIVE_FLIGHTS_SUBSCRIPTION },
      {
        next: ({ data }) => {
          const position = data?.liveFlights;
          if (!position) return;

          lastSeenRef.current.set(position.icao24, Date.now());
          setFlights(prev => {
            const next = new Map(prev);
            next.set(position.icao24, position);
            return next;
          });
        },
        error: err => {
          console.error('liveFlights subscription error', err);
        },
        complete: () => {
          console.warn('liveFlights subscription completed');
        },
      },
    );

    const pruneTimer = setInterval(() => {
      const now = Date.now();

      setFlights(prev => {
        let changed = false;
        const next = new Map(prev);

        for (const [icao24, lastSeen] of lastSeenRef.current.entries()) {
          if (now - lastSeen > STALE_THRESHOLD_MS) {
            next.delete(icao24);
            lastSeenRef.current.delete(icao24);
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
  }, []);

  return flights;
}