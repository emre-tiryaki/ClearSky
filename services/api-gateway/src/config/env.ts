export interface ApiGatewayConfig {
    port: number;
    rabbitMqUrl: string;
    exchangeName: string;
    exchangeType: 'topic';
    queueName: string;
    routingPattern: string;
    prefetchCount: number;
}

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value)
        throw new Error(`required field is missing in .env: ${name}`);

    return value;
}

export function loadConfig(): ApiGatewayConfig {
    return {
        port: Number(requireEnv('PORT')),
        rabbitMqUrl: requireEnv('RABBITMQ_URL'),
        exchangeName: requireEnv('RABBITMQ_EXCHANGE'),
        exchangeType: 'topic',
        queueName: requireEnv('RABBITMQ_QUEUE'),
        routingPattern: requireEnv('RABBITMQ_ROUTING_PATTERN'),
        prefetchCount: Number(requireEnv('RABBITMQ_PREFETCH')),

    }
}