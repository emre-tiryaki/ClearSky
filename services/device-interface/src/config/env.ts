// Configuration shape for the device-interface service.
export interface DeviceInterfaceConfig {
    openSkyBaseUrl: string;
    openSkyClientId: string;
    openSkyClientSecret: string;
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
        openSkyClientId: requireEnv("OPENSKY_CLIENT_ID"),
        openSkyClientSecret: requireEnv("OPENSKY_CLIENT_SECRET"),
        pollIntervalMs: Number(requireEnv('POLL_INTERVAL_MS')),
        rabbitMqUrl: requireEnv('RABBITMQ_URL'),
        exchangeName: requireEnv('RABBITMQ_EXCHANGE'),
        exchangeType: 'topic',
    }
}