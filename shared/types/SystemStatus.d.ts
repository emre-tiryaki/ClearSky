export type SystemStatusType = 'RATE_LIMITED' | 'AUTH_ERROR' | 'OK';

// Health-check payload published by the device-interface service after each poll cycle.
export interface SystemStatus {
    type: SystemStatusType;
    message: string;
    retryAfterSeconds: number | null;
    timestamp: Date;
}
