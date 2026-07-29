// Interface for publishing events to GraphQL subscribers, decoupled from Mercurius.
export interface EventPublisher {
    publish(topic: string, payload: unknown): Promise<void>;
}