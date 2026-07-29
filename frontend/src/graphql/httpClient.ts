// Typed response envelope for GraphQL HTTP calls.
interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

// Executes a GraphQL query or mutation over HTTP and returns the typed data payload.
export async function executeGraphQLOperation<T>(
    query:string,
    variables: Record<string, unknown>,
): Promise<T> {
    const url = import.meta.env.VITE_GRAPHQL_HTTP_URL;
    if (!url)
        throw new Error("VITE_GRAPHQL_HTTP_URL is not configured");

    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({query, variables}),
    });

    const payload = (await response.json()) as GraphQLResponse<T>;

    if (payload.errors?.length)
        throw new Error(payload.errors[0]!.message);

    if (!payload.data)
        throw new Error(`GraphQL response contained no data`);

    return payload.data;
}
