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

// used so the flights immediately sent to subscribers.
export async function* withInitialValues<T>(
    initials: T[],
    source: AsyncIterableIterator<T>,
): AsyncGenerator<T> {
    for (const initial of initials)
        yield initial;

    for await (const value of source)
        yield value;
}