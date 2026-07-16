import type { ConsumeMessage } from "amqplib";
import type { FlightPosition } from "../../../../shared/index.js";
import type { PositionPublisher } from "../graphql/PositionPublisher.js";

export const LIVE_FLIGHTS_TOPIC = "LIVE_FLIGHTS_UPDATED";

export class FlightMessageHandler {
    constructor(private readonly publisher: PositionPublisher) { }

    async handle(message: ConsumeMessage): Promise<void> {
        const position = this.parse(message);
        await this.publisher.publish(LIVE_FLIGHTS_TOPIC, position);
    }

    private parse(message: ConsumeMessage): FlightPosition {
        const raw = JSON.parse(message.content.toString()) as FlightPosition;
        return { ...raw, timestamp: new Date(raw.timestamp) };
    }
}