import { useCallback, useState } from "react";
import type { FlightRecord } from "../types/FlightRecord";
import { executeGraphQLOperation } from "../graphql/httpClient";
import { FLIGHT_HISTORY_QUERY } from "../graphql/queries";

interface FlightHistoryResult {
    flightHistory: FlightRecord[];
}

export function useFlightHistory() {
    const [history, setHistory] = useState<FlightRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async (icao24: string) => {
        setLoading(true);

        try {
            const result = await executeGraphQLOperation<FlightHistoryResult>(
                FLIGHT_HISTORY_QUERY,
                { icao24 },
            );
            setHistory(result.flightHistory);
        } finally {
            setLoading(false);
        }
    }, []);

    return { history, loading, fetch };
}