export interface PositionPublisher {
    publish(topic: string, payload: unknown): Promise<void>;
}