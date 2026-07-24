interface ImportMetaEnv {
    readonly VITE_GRAPHQL_WS_URL: string;
    readonly VITE_GRAPHQL_HTTP_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}