import type { SystemStatus } from "../../../../shared/index.js";

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