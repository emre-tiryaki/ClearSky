export type SystemStatusType = 'RATE_LIMITED' | 'OK';

export interface SystemStatus {
    type: SystemStatusType;
    message: string;
    retryAfterSeconds: number | null;
    timestamp: Date;
}
