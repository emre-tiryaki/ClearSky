import type { ConsumeMessage } from "amqplib";

export interface QueueMessageHandler {
    handle(message: ConsumeMessage): Promise<void>;
}