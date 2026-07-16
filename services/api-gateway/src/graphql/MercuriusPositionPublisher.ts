import type { PubSub } from "mercurius";
import type { PositionPublisher } from "./PositionPublisher.js";

export class MercuriusPositionPublisher implements PositionPublisher {
    constructor(private readonly pubsub: PubSub) { }

    async publish(topic: string, payload: unknown): Promise<void> {
        // THIS CODE IS JUST FOR TESTING AND DOES NOT AFFECT ANY WORK IN THIS SERVICE.
        // WILL PROBABLY BE DELETED WHEN MERGING.
        console.log(`${topic} is publishing`);
        await this.pubsub.publish({ topic, payload });
        console.log(`${topic} is published`);
    }

}