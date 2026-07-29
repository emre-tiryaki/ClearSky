import type { ConsumeMessage } from "amqplib";

// Interface for classes that process messages from a RabbitMQ queue.
export interface QueueMessageHandler {
    handle(message: ConsumeMessage): Promise<void>;
}