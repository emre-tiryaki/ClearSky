export interface DeviceInterfaceConfig {
    openSkyBaseUrl: string;
    openSkyUsername?: string | undefined;
    openSkyPassword?: string | undefined;
    pollIntervalMs: number;
    rabbitMqUrl: string;
    exchangeName: string;
    exchangeType: 'topic';
}

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value)
        throw new Error(`required field is missing in .env: ${name}`);

    return value;
}

export function loadConfig(): DeviceInterfaceConfig {
    return {
        openSkyBaseUrl: requireEnv('OPENSKY_BASE_URL'),
        openSkyUsername: process.env.OPENSKY_USERNAME,
        openSkyPassword: process.env.OPENSKY_PASSWORD,
        pollIntervalMs: Number(requireEnv('POLL_INTERVAL_MS')),
        rabbitMqUrl: requireEnv('RABBITMQ_URL'),
        exchangeName: requireEnv('RABBITMQ_EXCHANGE'),
        exchangeType: 'topic',
    }
}