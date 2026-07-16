import type { PubSub } from "mercurius";
import { LIVE_FLIGHTS_TOPIC } from "../../messaging/FlightMessageHandler.js";
import type { FlightPosition } from "../../../../../shared/index.js";

interface MercuriusContext {
    pubsub: PubSub;
}

export const resolvers = {
    Query: {
        _health: async () => "ok",
    },
    Subscription: {
        liveFlights: {
            subscribe: (_root: unknown, _args: unknown, context: MercuriusContext) =>
                context.pubsub.subscribe(LIVE_FLIGHTS_TOPIC),
            resolve: (payload: FlightPosition) => payload,
        }
    }
}