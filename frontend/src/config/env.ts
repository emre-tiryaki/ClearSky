export interface FrontendConfig {
    VITE_GRAPHQL_WS_URL: string;
}

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value)
        throw new Error(`required field is missing in .env: ${name}`);

    return value;
}

export function loadConfig(): FrontendConfig {
    return {
        VITE_GRAPHQL_WS_URL: requireEnv('VITE_GRAPHQL_WS_URL'),
    }
}