import type { PubSub } from "mercurius";
import type { EventPublisher } from "./EventPublisher.js";

// Mercurius-backed implementation of EventPublisher that delegates to PubSub.
export class MercuriusEventPublisher implements EventPublisher {
    constructor(private readonly pubsub: PubSub) { }

    async publish(topic: string, payload: unknown): Promise<void> {
        await this.pubsub.publish({ topic, payload });
    }
}