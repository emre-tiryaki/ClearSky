import { useCallback, useState } from "react";
import type { FlightRecord } from "../types/FlightRecord";
import { executeGraphQLOperation } from "../graphql/httpClient";
import { SAVE_FLIGHT_RECORD_MUTATION } from "../graphql/mutations";
import { FLIGHT_RECORDS_QUERY } from "../graphql/queries";

interface FlightRecordResult {
    flightRecords: FlightRecord[];
}

// Manages the set of actively-watched aircraft (frontend-only, cleared on page reload).
export function useWatchedFlights() {
    const [watchedIcao24s, setWatchedIcao24s] = useState<Set<string>>(new Set());
    const [records, setRecords] = useState<FlightRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    const toggleWatch = useCallback((icao24: string) => {
        setWatchedIcao24s(prev => {
            const next = new Set(prev);
            if (next.has(icao24)) next.delete(icao24);
            else next.add(icao24);

            return next;
        })
    }, []);

    const stopWatching = useCallback((icao24: string) => {
        setWatchedIcao24s(prev => {
            const next = new Set(prev);
            next.delete(icao24);
            return next;
        });
    }, []);

    const savePosition = useCallback(async (icao24: string) => {
        try {
            await executeGraphQLOperation(SAVE_FLIGHT_RECORD_MUTATION, { input: { icao24 } });
        } catch (error) {
            console.error("useWatchedFlights: auto-save failde for", icao24, error);
        }
    }, []);

    const fetchRecords = useCallback(async (startDate: string, endDate: string) => {
        setLoadingRecords(true);
        try {
            const result = await executeGraphQLOperation<FlightRecordResult>(
                FLIGHT_RECORDS_QUERY,
                { startDate, endDate },
            );
            setRecords(result.flightRecords);
        } finally {
            setLoadingRecords(false);
        }
    }, []);

    return {
        watchedIcao24s,
        records,
        loadingRecords,
        toggleWatch,
        stopWatching,
        savePosition,
        fetchRecords,
    };
}