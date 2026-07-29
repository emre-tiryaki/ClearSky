export interface EventPublisher {
    publish(topic: string, payload: unknown): Promise<void>;
}