import { useEffect, useState } from "react";
import type { SystemStatus } from "../types/SystemStatus";
import { getGraphQlWsClient } from "../graphql/client";
import { SYSTEM_STATUS_SUBSCRIPTION } from "../graphql/queries";

// Subscribes to the systemStatus GraphQL subscription and returns the latest status, or null.
export function useSystemStatus(): SystemStatus | null {
    const [status, setStatus] = useState<SystemStatus | null>(null);

    useEffect(() => {
        const client = getGraphQlWsClient();

        const unsubscribe = client.subscribe<{ systemStatus: SystemStatus }>(
            { query: SYSTEM_STATUS_SUBSCRIPTION },
            {
                next: ({ data }) => {
                    const value = data?.systemStatus;
                    if (value) setStatus(value);
                },
                error: err => {
                    console.error("systemStatus subscription error", err);
                },
                complete: () => {
                    console.warn("systemStatus subscription completed");
                },
            },
        );

        return () => unsubscribe();
    }, []);

    return status;
}