import { useCallback, useState } from "react";
import type { FlightRecord } from "../types/FlightRecord";
import { executeGraphQLOperation } from "../graphql/httpClient";
import { SAVE_FLIGHT_RECORD_MUTATION } from "../graphql/mutations";

interface SaveFlightRecordResult {
    saveFlightRecord: FlightRecord;
}

// Provides a `save` callback that persists the current live position as a flight record.
export function useSaveFlightRecord() {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const save = useCallback(async (icao24: string, note?: string): Promise<FlightRecord> => {
        setSaving(true);
        setError(null);

        try {
            const result = await executeGraphQLOperation<SaveFlightRecordResult>(
                SAVE_FLIGHT_RECORD_MUTATION,
                { input: { icao24, note: note?.trim() || undefined } }
            );
            return result.saveFlightRecord;
        } catch (error) {
            const message = error instanceof Error ? error.message : "unknown error";
            setError(message);
            throw error;
        } finally {
            setSaving(false);
        }
    }, []);

    return {save, saving, error};
}