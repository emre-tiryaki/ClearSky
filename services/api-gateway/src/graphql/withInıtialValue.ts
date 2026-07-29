// Prepends an optional initial value before the async iterable.
// Used so new systemStatus subscribers immediately receive the current status.
export async function* withInitialValue<T>(
    initial: T | null,
    source: AsyncIterableIterator<T>,
): AsyncGenerator<T> {
    if (initial !== null)
        yield initial;

    for await (const value of source)
        yield value;
}