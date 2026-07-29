import type { SystemStatus } from "../../../../shared/index.js";
import type { AmqpConnectionManager } from "./AmqpConnectionManager.js";
import type { AmqpPublisher } from "./AmqpPublisher.js";

const STATUS_ROUTING_KEY = "system.status";

// Publishes system health-check status messages to the AMQP exchange.
export class StatusPublisher implements AmqpPublisher<SystemStatus> {
    constructor(
        private readonly connectionManager: AmqpConnectionManager,
        private readonly exchange: string
    ) {}

    async publish(status: SystemStatus): Promise<void> {
        const channel = this.connectionManager.getChannel();
        channel.publish(this.exchange, STATUS_ROUTING_KEY, Buffer.from(
            JSON.stringify(status)
        ), {
            contentType: "application/json",
            persistent: false
        });
    }
}