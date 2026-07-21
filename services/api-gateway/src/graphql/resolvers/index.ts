import type { PubSub } from "mercurius";
import { LIVE_FLIGHTS_TOPIC } from "../../messaging/FlightMessageHandler.js";
import type { FlightPosition, SystemStatus } from "../../../../../shared/index.js";
import { filterByBoundingBox } from "../filterByBoundingBox.js";
import type { BoundingBox } from "../BoundingBox.js";
import { SYSTEM_STATUS_TOPIC } from "../../messaging/SystemStatusMessageHandler.js";
import { withInitialValue } from "../withInıtialValue.js";
import { systemStatusStore } from "../../messaging/SystemStatusStore.js";

interface MercuriusContext {
    pubsub: PubSub;
}

export const resolvers = {
    Query: {
        _health: async () => "ok",
    },
    Subscription: {
        liveFlights: {
            subscribe: async (_root: unknown, args: { bbox: BoundingBox }, context: MercuriusContext) => {
                const source = await context.pubsub.subscribe(LIVE_FLIGHTS_TOPIC) as AsyncIterableIterator<FlightPosition>;
                return filterByBoundingBox(source, args.bbox);
            },
            resolve: (payload: FlightPosition) => payload,
        },
        systemStatus: {
            subscribe: async (_root: unknown, args: unknown, context: MercuriusContext) => {
                const source = await context.pubsub.subscribe(SYSTEM_STATUS_TOPIC) as AsyncIterableIterator<SystemStatus>;
                return withInitialValue(systemStatusStore.get(), source);
            },
            resolve: (payload: SystemStatus) => payload,
        },
    },
    FlightPosition: {
        timestamp: (parent: FlightPosition) => parent.timestamp.toISOString(),
    },
    SystemStatus: {
        timestamp: (parent: SystemStatus) => parent.timestamp.toISOString(),
    }
}