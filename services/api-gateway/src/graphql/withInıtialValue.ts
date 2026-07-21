export async function* withInitialValue<T>(
    initial: T | null,
    source: AsyncIterableIterator<T>,
): AsyncGenerator<T> {
    if (initial !== null)
        yield initial;

    for await (const value of source)
        yield value;
}