import type { FlightPosition } from "../../../../shared/index.js";
import type { AmqpConnectionManager } from "./AmqpConnectionManager.js";

// Publishes normalized flight positions to the configured AMQP exchange.
export class FlightPublisher {
    constructor(
        private readonly connectionManager: AmqpConnectionManager,
        private readonly exchange: string
    ) {}

    // Sends each flight position as a JSON message to the broker.
    async publish(positions: FlightPosition[]): Promise<void> {
        const channel = this.connectionManager.getChannel();

        for(const position of positions) {
            const routingKey = this.buildingRoutingKey(position.icao24);
            channel.publish(this.exchange, routingKey, Buffer.from(
                JSON.stringify(position)
            ), {
                contentType: 'application/json',
                persistent: true
            })
        }
    }

    // Builds the AMQP routing key used to route a flight position message.
    buildingRoutingKey(icao24: string): string {
        throw new Error("Method not implemented.");
    }
}