import { error } from "node:console";
import { loadConfig } from "../config/env.js";
import { AmqpConnectionManager } from "../messaging/AmqpConnectionManager.js";
import { FlightPublisher } from "../messaging/FlightPublisher.js";
import { StateVectorNormalizer } from "../normalizer/StateVectorNormalizer.js";
import { OpenSkyClient, OpenSkyRateLimitError } from "../opensky/OpenSkyClient.js";
import { PollingScheduler } from "../scheduler/PollingScheduler.js";

async function main(): Promise<void> {
	const config = loadConfig();

	const openSkyClient = new OpenSkyClient(config.openSkyBaseUrl);
	const normalizer = new StateVectorNormalizer();

	const connectionManager = new AmqpConnectionManager(
		config.rabbitMqUrl,
		config.exchangeName,
		config.exchangeType,
	);
	await connectionManager.connect();

	const publisher = new FlightPublisher(connectionManager, config.exchangeName);

	const performCycle = async (): Promise<void> => {
		try {
			const rawState = await openSkyClient.fetchStates();
			const positions = normalizer.normalize(rawState);
			await publisher.publish(positions);
			// TODO: THIS IS FOR TESTING IF THE SERVICE IS WORKING LIKE ITS MEANT TO. 
			// THIS CANNOT BE MERGED WITH MAIN.
			console.log(`${rawState.length} count.`);
		} catch (error) {
			if (error instanceof OpenSkyRateLimitError) {
				console.warn(`OpenSky Rate Limit: will retry after ${error.retryAfterSeconds} seconds`);
				return;
			}

			throw error;
		}
	}

	const scheduler = new PollingScheduler(config.pollIntervalMs, performCycle);
	scheduler.start();

	process.on('SIGTERM', () => scheduler.stop())
	process.on('SIGINT', () => scheduler.stop())
}

main().catch(error => {
	console.error("device-interface service couldn't be started", error);
	process.exit(1);
})