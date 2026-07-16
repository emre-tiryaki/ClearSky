import type { PubSub } from "mercurius";
import type { PositionPublisher } from "./PositionPublisher.js";

export class MercuriusPositionPublisher implements PositionPublisher {
    constructor(private readonly pubsub: PubSub) { }

    async publish(topic: string, payload: unknown): Promise<void> {
        await this.pubsub.publish({ topic, payload });
    }

}