import type { ConsumeMessage } from "amqplib";
import type { FlightPosition } from "../../../../shared/index.js";
import type { PositionPublisher } from "../graphql/PositionPublisher.js";
import type { LiveFlightStore } from "./LiveFlightStore.js";
import type { QueueMessageHandler } from "./QueueMessageHandler.js";

export const LIVE_FLIGHTS_TOPIC = "LIVE_FLIGHTS_UPDATED";

export class FlightMessageHandler implements QueueMessageHandler {
    constructor(
        private readonly publisher: PositionPublisher,
        private readonly store: LiveFlightStore,
    ) { }

    async handle(message: ConsumeMessage): Promise<void> {
        const position = this.parse(message);
        this.store.set(position);
        await this.publisher.publish(LIVE_FLIGHTS_TOPIC, position);
    }

    private parse(message: ConsumeMessage): FlightPosition {
        const raw = JSON.parse(message.content.toString()) as FlightPosition;
        return { ...raw, timestamp: new Date(raw.timestamp) };
    }
}