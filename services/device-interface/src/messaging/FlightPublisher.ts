import type { FlightPosition } from "../../../../shared/index.js";
import type { AmqpConnectionManager } from "./AmqpConnectionManager.js";
import type { AmqpPublisher } from "./AmqpPublisher.js";

// Publishes normalized flight positions to the AMQP exchange, one message per aircraft.
export class FlightPublisher implements AmqpPublisher<FlightPosition[]> {
    constructor(
        private readonly connectionManager: AmqpConnectionManager,
        private readonly exchange: string
    ) { }

    // Sends each flight position as a JSON message to the broker.
    async publish(positions: FlightPosition[]): Promise<void> {
        for (const position of positions) {
            this.connectionManager.publishJson(
                this.exchange,
                this.buildRoutingKey(position.icao24),
                position,
            );
        }
    }

    // Builds the AMQP routing key used to route a flight position message.
    buildRoutingKey(icao24: string): string {
        return `flight.position.${icao24}`;
    }
}