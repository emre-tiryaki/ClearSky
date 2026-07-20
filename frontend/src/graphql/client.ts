import { createClient, type Client } from "graphql-ws";
import { loadConfig } from "../config/env";

let client: Client | null = null;

export function getGraphQlWsClient(): Client {
    if (!client) {
        const { graphqlWsUrl } = loadConfig();
        client = createClient({ url: graphqlWsUrl });
    }
    
    return client;
}
