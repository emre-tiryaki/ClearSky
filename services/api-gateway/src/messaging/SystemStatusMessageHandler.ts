import type { ConsumeMessage } from "amqplib";
import type { PositionPublisher } from "../graphql/PositionPublisher.js";
import type { SystemStatus } from "../../../../shared/index.js";

export const SYSTEM_STATUS_TOPIC = 'SYSTEM_STATUS_UPDATED';

export class SystemStatusMessageHandler {
    constructor(private readonly publisher: PositionPublisher) {}

    async handle(messsage: ConsumeMessage): Promise<void> {
        const status = this.parse(messsage);
        await this.publisher.publish(SYSTEM_STATUS_TOPIC, status);
    }

    private parse(messsage: ConsumeMessage) {
        const raw = JSON.parse(messsage.content.toString()) as SystemStatus;
        return { ...raw, timestamp: new Date(raw.timestamp) }
    }
}