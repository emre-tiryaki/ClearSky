import type { SystemStatus } from "../../../../shared/index.js";
import type { AmqpConnectionManager } from "./AmqpConnectionManager.js";
import type { AmqpPublisher } from "./AmqpPublisher.js";

const STATUS_ROUTING_KEY = "system.status";

// Publishes system health-check status messages to the AMQP exchange.
export class StatusPublisher implements AmqpPublisher<SystemStatus> {
    constructor(
        private readonly connectionManager: AmqpConnectionManager,
        private readonly exchange: string
    ) { }

    // Sends status of the service to the broker
    async publish(status: SystemStatus): Promise<void> {
        this.connectionManager.publishJson(
            this.exchange,
            STATUS_ROUTING_KEY,
            status,
            false,
        );
    }
}