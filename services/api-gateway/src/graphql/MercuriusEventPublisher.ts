import type { PubSub } from "mercurius";
import type { EventPublisher } from "./EventPublisher.js";

export class MercuriusEventPublisher implements EventPublisher {
    constructor(private readonly pubsub: PubSub) { }

    async publish(topic: string, payload: unknown): Promise<void> {
        await this.pubsub.publish({ topic, payload });
    }
}