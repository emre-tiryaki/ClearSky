import mercurius from "mercurius";
import { loadConfig } from "../config/env.js";
import Fastify from "fastify";
import { typeDefs } from "../graphql/schema.js";
import {resolvers} from "../graphql/resolvers/index.js"
import { MercuriusPositionPublisher } from "../graphql/MercuriusPositionPublisher.js";
import { AmqpConsumerManager } from "../messaging/AmqpConsumerManager.js";
import { FlightMessageHandler } from "../messaging/FlightMessageHandler.js";
import { SystemStatusMessageHandler } from "../messaging/SystemStatusMessageHandler.js";

async function main(): Promise<void> {
	const config = loadConfig();
	const app = Fastify();

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

	const messageHandler = new FlightMessageHandler(publisher);
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

	process.on('SIGTERM', () => app.close());
    process.on('SIGINT', () => app.close());
}

main().catch(error => {
	console.error("api-gateway service couldn't be started", error);
	process.exit(1);
})