import type { ConsumeMessage } from "amqplib";
import type { FlightPosition } from "../../../../shared/index.js";
import type { EventPublisher } from "../graphql/EventPublisher.js";
import type { LiveFlightStore } from "./LiveFlightStore.js";
import type { QueueMessageHandler } from "./QueueMessageHandler.js";
import type { FlightRepository } from "../persistence/FlightRepository.js";
import type { WatchStore } from "./WatchStore.js";

export const LIVE_FLIGHTS_TOPIC = "LIVE_FLIGHTS_UPDATED";

// Handles incoming flight-position messages from RabbitMQ.
// Parses the JSON body, updates the in-memory live store,
// publishes the position to GraphQL subscribers,
// and persists the position if the aircraft is being watched.
export class FlightMessageHandler implements QueueMessageHandler {
    constructor(
        private readonly publisher: EventPublisher,
        private readonly store: LiveFlightStore,
        private readonly watchStore: WatchStore,
        private readonly flightRepository: FlightRepository,
    ) { }

    async handle(message: ConsumeMessage): Promise<void> {
        const position = this.parse(message);
        this.store.set(position);
        await this.publisher.publish(LIVE_FLIGHTS_TOPIC, position);

        if (this.watchStore.isWatched(position.icao24)) {
            try {
                await this.flightRepository.save(position);
            } catch (err) {
                console.error(`WatchStore: failed to save position for ${position.icao24}`, err);
            }
        }
    }

    private parse(message: ConsumeMessage): FlightPosition {
        const raw = JSON.parse(message.content.toString()) as FlightPosition;
        return { ...raw, timestamp: new Date(raw.timestamp) };
    }
}