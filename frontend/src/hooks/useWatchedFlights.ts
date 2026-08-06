import { useCallback, useEffect, useState } from "react";
import type { FlightRecord } from "../types/FlightRecord";
import { executeGraphQLOperation } from "../graphql/httpClient";
import {
    WATCH_FLIGHT_MUTATION,
    UNWATCH_FLIGHT_MUTATION,
    UNWATCH_ALL_MUTATION,
} from "../graphql/mutations";
import { FLIGHT_RECORDS_QUERY, WATCHED_ICAO24S_QUERY } from "../graphql/queries";

interface FlightRecordsResult {
    flightRecords: FlightRecord[];
}

interface WatchedIcao24sResult {
    watchedIcao24s: string[];
}

// Manages the set of actively-watched aircraft.
// The actual position saving happens on the backend (api-gateway) whenever
// a watched aircraft reports a new position via RabbitMQ.
// This hook only tells the backend which aircraft to watch/unwatch
// and provides historical record querying for the panel.
export function useWatchedFlights() {
    const [watchedIcao24s, setWatchedIcao24s] = useState<Set<string>>(new Set());
    const [records, setRecords] = useState<FlightRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    const toggleWatch = useCallback(async (icao24: string) => {
        setWatchedIcao24s(prev => {
            const next = new Set(prev);
            if (next.has(icao24)) {
                next.delete(icao24);
                void executeGraphQLOperation(UNWATCH_FLIGHT_MUTATION, { icao24 });
            } else {
                next.add(icao24);
                void executeGraphQLOperation(WATCH_FLIGHT_MUTATION, { icao24 });
            }
            return next;
        });
    }, []);

    const stopWatching = useCallback((icao24: string) => {
        setWatchedIcao24s(prev => {
            const next = new Set(prev);
            next.delete(icao24);
            return next;
        });
        void executeGraphQLOperation(UNWATCH_FLIGHT_MUTATION, { icao24 });
    }, []);

    const fetchRecords = useCallback(async (startDate: string, endDate: string) => {
        setLoadingRecords(true);
        try {
            const result = await executeGraphQLOperation<FlightRecordsResult>(
                FLIGHT_RECORDS_QUERY,
                { startDate, endDate },
            );
            setRecords(result.flightRecords);
        } finally {
            setLoadingRecords(false);
        }
    }, []);

    // On mount, fetch the list of currently watched aircraft from the backend.
    useEffect(() => {
        void (async () => {
            try {
                const result = await executeGraphQLOperation<WatchedIcao24sResult>(
                    WATCHED_ICAO24S_QUERY
                );
                if (result && result.watchedIcao24s) {
                    setWatchedIcao24s(new Set(result.watchedIcao24s));
                }
            } catch (err) {
                console.error("Failed to fetch initially watched aircraft", err);
            }
        })();
    }, []);

    return {
        watchedIcao24s,
        records,
        loadingRecords,
        toggleWatch,
        stopWatching,
        fetchRecords,
    };
}