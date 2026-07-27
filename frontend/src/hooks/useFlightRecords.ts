import { useCallback, useState } from "react";
import type { FlightRecord } from "../types/FlightRecord";
import { executeGraphQLOperation } from "../graphql/httpClient";
import { FLIGHT_RECORDS_QUERY } from "../graphql/queries";

interface FlightRecordsResult {
    flightRecords: FlightRecord[]
}

export function useFlightRecords() {
    const [records, setRecords] = useState<FlightRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);

        try {
            const result = await executeGraphQLOperation<FlightRecordsResult>(
                FLIGHT_RECORDS_QUERY,
                { startDate, endDate },
            );
            setRecords(result.flightRecords);
        } catch (error) {
            setError(error instanceof Error ? error.message : "unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    return { records, loading, error, fetch };
}