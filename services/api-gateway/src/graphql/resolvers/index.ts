import type { PubSub } from "mercurius";
import { LIVE_FLIGHTS_TOPIC } from "../../messaging/FlightMessageHandler.js";
import type { FlightPosition } from "../../../../../shared/index.js";
import { filterByBoundingBox } from "../filterByBoundingBox.js";
import type { BoundingBox } from "../BoundingBox.js";

interface MercuriusContext {
    pubsub: PubSub;
}

export const resolvers = {
    Query: {
        _health: async () => "ok",
    },
    Subscription: {
        liveFlights: {
            subscribe: async (_root: unknown, args: {bbox: BoundingBox}, context: MercuriusContext) =>{
                const source = await context.pubsub.subscribe(LIVE_FLIGHTS_TOPIC) as AsyncIterableIterator<FlightPosition>;                
                return filterByBoundingBox(source, args.bbox);
            },
            resolve: (payload: FlightPosition) => payload,
        }
    },
    FlightPosition: {
        timestamp: (parent: FlightPosition) => parent.timestamp.toISOString(),
    }
}