export interface SystemStatus {
    type: 'RATE_LIMITED' | 'OK';
    message: string;
    retryAfterSeconds: number | null;
    timestamp: string;
}