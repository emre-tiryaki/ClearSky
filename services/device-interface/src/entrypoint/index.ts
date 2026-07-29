import type { SystemStatusType } from "../../../../shared/index.js";
import { loadConfig } from "../config/env.js";
import { AmqpConnectionManager } from "../messaging/AmqpConnectionManager.js";
import { FlightPublisher } from "../messaging/FlightPublisher.js";
import { StatusPublisher } from "../messaging/StatusPublisher.js";
import { StateVectorNormalizer } from "../normalizer/StateVectorNormalizer.js";
import { OpenSkyClient, OpenSkyRateLimitError } from "../opensky/OpenSkyClient.js";
import { OpenSkyAuthError, OpenSkyTokenManager } from "../opensky/OpenSkyTokenManager.js";
import { PollingScheduler } from "../scheduler/PollingScheduler.js";

async function main(): Promise<void> {
	const config = loadConfig();

	const tokenManager = new OpenSkyTokenManager(config.openSkyClientId, config.openSkyClientSecret);
	const openSkyClient = new OpenSkyClient(config.openSkyBaseUrl, tokenManager);
	const normalizer = new StateVectorNormalizer();

	const connectionManager = new AmqpConnectionManager(
		config.rabbitMqUrl,
		config.exchangeName,
		config.exchangeType,
	);
	await connectionManager.connect();

	const publisher = new FlightPublisher(connectionManager, config.exchangeName);
	const statusPublisher = new StatusPublisher(connectionManager, config.exchangeName);

	let lastStatusType: SystemStatusType | null = null;

	const publishStatusIfChanged = async (
		type: SystemStatusType,
		message: string,
		retryAfterSeconds: number | null
	): Promise<void> => {
		if (type === lastStatusType) return;

		lastStatusType = type;
		await statusPublisher.publish({ type, message, retryAfterSeconds, timestamp: new Date() });
	}

	const performCycle = async (): Promise<number | void> => {
		try {
			const rawState = await openSkyClient.fetchStates();
			const positions = normalizer.normalize(rawState);
			await publisher.publish(positions);
			await publishStatusIfChanged('OK', 'Data transfer is normal', null);
		} catch (error) {
			if (error instanceof OpenSkyRateLimitError) {
				console.warn(`OpenSky Rate Limit: will retry after ${error.retryAfterSeconds} seconds`);
				await publishStatusIfChanged(
					'RATE_LIMITED',
					'OpenSky Network API Rate limit is exceeded.',
					error.retryAfterSeconds
				)
				return;
			} else if (error instanceof OpenSkyAuthError) {
				console.warn(`OpenSky Auth Error: there is an authentication error: ${error.message}`);
				await publishStatusIfChanged(
					'AUTH_ERROR',
					'OpenSky Network API auth error, token may not be valid.',
					0
				)
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