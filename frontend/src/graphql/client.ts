import { createClient, type Client } from "graphql-ws";
import { loadConfig } from "../config/env";

let client: Client | null = null;

// Returns a singleton graphql-ws Client, created lazily on first call.
export function getGraphQlWsClient(): Client {
    if (!client) {
        const { graphqlWsUrl } = loadConfig();
        client = createClient({ url: graphqlWsUrl });
    }
    
    return client;
}
