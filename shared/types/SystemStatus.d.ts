export type SystemStatusType = 'RATE_LIMITED' | 'AUTH_ERROR' | 'OK';

export interface SystemStatus {
    type: SystemStatusType;
    message: string;
    retryAfterSeconds: number | null;
    timestamp: Date;
}
