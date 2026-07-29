import type { SystemStatus } from "../../../../shared/index.js";

// Singleton store that holds the most recent SystemStatus for initial-value delivery on new subscriptions.
export class SystemStatusStore {
    private current: SystemStatus | null = null;

    set(status: SystemStatus): void {
        this.current = status;
    }

    get(): SystemStatus | null {
        return this.current;
    }
}

export const systemStatusStore = new SystemStatusStore();