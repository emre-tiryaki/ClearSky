import type { ConsumeMessage } from "amqplib";
import type { EventPublisher } from "../graphql/EventPublisher.js";
import type { SystemStatus } from "../../../../shared/index.js";
import { systemStatusStore } from "./SystemStatusStore.js";
import type { QueueMessageHandler } from "./QueueMessageHandler.js";

export const SYSTEM_STATUS_TOPIC = 'SYSTEM_STATUS_UPDATED';

export class SystemStatusMessageHandler implements QueueMessageHandler{
    constructor(private readonly publisher: EventPublisher) {}

    async handle(messsage: ConsumeMessage): Promise<void> {
        const status = this.parse(messsage);
        systemStatusStore.set(status);
        await this.publisher.publish(SYSTEM_STATUS_TOPIC, status);
    }

    private parse(messsage: ConsumeMessage) {
        const raw = JSON.parse(messsage.content.toString()) as SystemStatus;
        return { ...raw, timestamp: new Date(raw.timestamp) }
    }
}