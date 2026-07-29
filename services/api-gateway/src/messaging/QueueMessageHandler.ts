import type { ConsumeMessage } from "amqplib";

// Contract for classes that process messages from a RabbitMQ queue.
export interface QueueMessageHandler {
    handle(message: ConsumeMessage): Promise<void>;
}