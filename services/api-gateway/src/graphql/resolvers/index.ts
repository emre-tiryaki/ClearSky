import type { PubSub } from "mercurius";
import { LIVE_FLIGHTS_TOPIC } from "../../messaging/FlightMessageHandler.js";
import type { FlightPosition, SystemStatus } from "../../../../../shared/index.js";
import { filterByBoundingBox } from "../filterByBoundingBox.js";
import type { BoundingBox } from "../BoundingBox.js";
import { SYSTEM_STATUS_TOPIC } from "../../messaging/SystemStatusMessageHandler.js";
import { withInitialValue } from "../withInıtialValue.js";
import { systemStatusStore } from "../../messaging/SystemStatusStore.js";
import { GraphQLError } from "graphql"
import { FlightRepository } from "../../persistence/FlightRepository.js";
import type { LiveFlightStore } from "../../messaging/LiveFlightStore.js";

interface MercuriusContext {
    pubsub: PubSub;
}

interface ResolverDependencies {
    liveFlightStore: LiveFlightStore,
    flightRepository: FlightRepository
}

export function createResolvers(deps: ResolverDependencies) {
    return {
        Query: {
            _health: async () => "ok",
        },
        Mutation: {
            saveFlightRecord: async (
                _root: unknown,
                args: { input: { icao24: string, note?: string } },
            ) => {
                const position = deps.liveFlightStore.get(args.input.icao24);
                if (!position)
                    throw new GraphQLError(`no live data is available for aircraft ${args.input.icao24}`);

                return deps.flightRepository.save(position, args.input.note);
            },
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
}