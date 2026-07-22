import mercurius from "mercurius";
import { loadConfig } from "../config/env.js";
import Fastify from "fastify";
import { typeDefs } from "../graphql/schema.js";
import { MercuriusPositionPublisher } from "../graphql/MercuriusPositionPublisher.js";
import { AmqpConsumerManager } from "../messaging/AmqpConsumerManager.js";
import { FlightMessageHandler } from "../messaging/FlightMessageHandler.js";
import { SystemStatusMessageHandler } from "../messaging/SystemStatusMessageHandler.js";
import { createResolvers } from "../graphql/resolvers/index.js";
import { MongoConnection } from "../persistence/MongoConnection.js";
import { FlightRepository } from "../persistence/FlightRepository.js";
import { LiveFlightStore } from "../messaging/LiveFlightStore.js";

async function main(): Promise<void> {
	const config = loadConfig();
	const app = Fastify();

	const mongoConnection = new MongoConnection(config.mongoUri, config.mongoDbName);
	const db = await mongoConnection.connect();
	const flightRepository = new FlightRepository(db);

	const liveFlightStore = new LiveFlightStore();
	const resolvers	 = createResolvers({liveFlightStore, flightRepository});

	await app.register(mercurius, {
		schema: typeDefs,
		resolvers,
		subscription: true,
		graphiql: config.graphiqlEnabled,
	});

	const publisher = new MercuriusPositionPublisher(app.graphql.pubsub);

	const consumerManager = new AmqpConsumerManager(
		config.rabbitMqUrl,
		config.exchangeName,
		config.exchangeType,
		config.queueName,
		config.routingPattern,
		config.prefetchCount,
	);
	await consumerManager.connect();

	const messageHandler = new FlightMessageHandler(publisher, liveFlightStore);
	await consumerManager.consume(message => messageHandler.handle(message));

	const statusConsumerManager = new AmqpConsumerManager(
		config.rabbitMqUrl,
		config.exchangeName,
		config.exchangeType,
		config.statusQueueName,
		config.statusRoutingPattern,
		config.prefetchCount
	);
	await statusConsumerManager.connect();

	const statusMessageHandler = new SystemStatusMessageHandler(publisher);
	await statusConsumerManager.consume(message => statusMessageHandler.handle(message));

	await app.listen({port: config.port, host: "0.0.0.0"});

	const shutdown = async (): Promise<void> => {
		await app.close();
		await mongoConnection.close();
	}

	process.on('SIGTERM', () => void shutdown());
    process.on('SIGINT', () => void shutdown());
}

main().catch(error => {
	console.error("api-gateway service couldn't be started", error);
	process.exit(1);
})