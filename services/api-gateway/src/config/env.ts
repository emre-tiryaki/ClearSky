// Configuration shape for the api-gateway service.
export interface ApiGatewayConfig {
    port: number;
    rabbitMqUrl: string;
    exchangeName: string;
    exchangeType: 'topic';
    queueName: string;
    routingPattern: string;
    prefetchCount: number;
    statusQueueName: string;
    statusRoutingPattern: string;
    graphiqlEnabled: boolean;
    mongoUri: string;
    mongoDbName: string;
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
        statusQueueName: requireEnv('RABBITMQ_STATUS_QUEUE'),
        statusRoutingPattern: requireEnv('RABBITMQ_STATUS_ROUTING_PATTERN'),
        graphiqlEnabled: requireEnv('GRAPHIQL_ENABLED') === 'true',
        mongoUri: requireEnv("MONGODB_URI"),
        mongoDbName: requireEnv("MONGODB_DB_NAME"),
    }
}