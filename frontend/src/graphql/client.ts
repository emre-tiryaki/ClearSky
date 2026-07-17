import { createClient, type Client } from "graphql-ws";
import { loadConfig } from "../config/env";

let client: Client | null = null;

export function getGraphQlWsClient(): Client {
    if (!client) {
        const url = loadConfig().VITE_GRAPHQL_WS_URL;
        client = createClient({url});
    }

    return client;
}