export interface FrontendConfig {
    graphqlWsUrl: string;
    graphqlHttpUrl: string;
}

function requireEnv(name: keyof ImportMetaEnv): string {
    const value = import.meta.env[name];
    if(!value)
        throw new Error(`env variable missing: ${name}`);

    return value;
}

export function loadConfig(): FrontendConfig {
    return {
        graphqlWsUrl: requireEnv('VITE_GRAPHQL_WS_URL'),
        graphqlHttpUrl: requireEnv('VITE_GRAPHQL_HTTP_URL')
    }
}