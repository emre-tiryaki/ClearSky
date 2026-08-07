import type { PubSub } from "mercurius";
import { LIVE_FLIGHTS_TOPIC } from "../../messaging/FlightMessageHandler.js";
import type { BoundingBox, FlightPosition, SavedBookmark, SavedFlightRecord, SystemStatus } from "../../../../../shared/index.js";
import { filterByBoundingBox } from "../filterByBoundingBox.js";
import { SYSTEM_STATUS_TOPIC } from "../../messaging/SystemStatusMessageHandler.js";
import { withInitialValue, withInitialValues } from "../withInitialValue.js";
import { systemStatusStore } from "../../messaging/SystemStatusStore.js";
import { GraphQLError } from "graphql"
import { FlightRepository } from "../../persistence/FlightRepository.js";
import type { LiveFlightStore } from "../../messaging/LiveFlightStore.js";
import type { BookmarkRepository } from "../../persistence/BookmarkRepository.js";
import type { WatchStore } from "../../messaging/WatchStore.js";

// Mercurius context injected into every resolver.
interface MercuriusContext {
    pubsub: PubSub;
}

// Dependencies injected into the resolver factory. 
interface ResolverDependencies {
    liveFlightStore: LiveFlightStore;
    flightRepository: FlightRepository;
    bookmarkRepository: BookmarkRepository;
    watchStore: WatchStore;
}

// Creates the GraphQL resolver map.
// Queries read from the live store and MongoDB; subscriptions stream via PubSub.
// Field resolvers handle Date-to-ISO serialization and nested document flattening.
export function createResolvers(deps: ResolverDependencies) {
    return {
        Query: {
            _health: async () => "ok",
            flightRecords: async (
                _root: unknown,
                args: { startDate: string, endDate: string }
            ) => {
                const start = new Date(args.startDate);
                const end = new Date(args.endDate);
                if (isNaN(start.getTime()))
                    throw new GraphQLError(`Invalid startDate: "${args.startDate}"`);
                if (isNaN(end.getTime()))
                    throw new GraphQLError(`Invalid endDate: "${args.endDate}"`);
                if (start > end)
                    throw new GraphQLError("Start date cannot be later than end date!!!");

                return deps.flightRepository.findByDateRange(start, end);
            },
            flightHistory: async (_root: unknown, args: { icao24: string }) => {
                return deps.flightRepository.findByIcao24(args.icao24);
            },
            bookmarks: async () => {
                return deps.bookmarkRepository.findAll();
            },
            watchedIcao24s: async () => {
                return deps.watchStore.getAll();
            }
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
            bookmarkFlight: async (
                _root: unknown,
                args: { icao24: string, callsign?: string, category: number },
            ) => {
                return deps.bookmarkRepository.save(args.icao24, args.callsign ?? null, args.category);
            },
            removeBookmark: async (
                _root: unknown,
                args: { icao24: string },
            ) => {
                return deps.bookmarkRepository.remove(args.icao24);
            },
            watchFlight: async (
                _root: unknown,
                args: { icao24: string },
            ) => {
                deps.watchStore.watch(args.icao24);
                return true;
            },
            unwatchFlight: async (
                _root: unknown,
                args: { icao24: string },
            ) => {
                deps.watchStore.unwatch(args.icao24);
                return true;
            },
            unwatchAll: async () => {
                deps.watchStore.unwatchAll();
                return true;
            }
        },
        Subscription: {
            liveFlights: {
                subscribe: async (_root: unknown, args: { bbox: BoundingBox }, context: MercuriusContext) => {
                    const source = await context.pubsub.subscribe(LIVE_FLIGHTS_TOPIC) as AsyncIterableIterator<FlightPosition>;
                    const filteredSource = filterByBoundingBox(source, args.bbox);

                    const initials = deps.liveFlightStore.getInBboxWithHistory(args.bbox);

                    return withInitialValues(initials, filteredSource);
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
        },
        FlightRecord: {
            id: (parent: SavedFlightRecord) => parent._id,
            latitude: (parent: SavedFlightRecord) => parent.position.lat,
            longitude: (parent: SavedFlightRecord) => parent.position.lon,
            recordedAt: (parent: SavedFlightRecord) => parent.recordedAt.toISOString(),
            savedAt: (parent: SavedFlightRecord) => parent.savedAt.toISOString(),
            category: (parent: SavedFlightRecord) => parent.category
        },
        Bookmark: {
            id: (parent: SavedBookmark) => parent._id,
            createdAt: (parent: SavedBookmark) => parent.createdAt.toISOString()
        }
    }
}