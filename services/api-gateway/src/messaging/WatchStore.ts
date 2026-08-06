// In-memory store for actively watched aircraft icao24 identifiers.
// Ephemeral — cleared on server restart.
export class WatchStore {
    private readonly watched = new Set<string>();

    watch(icao24: string): void {
        this.watched.add(icao24);
    }

    unwatch(icao24: string): void {
        this.watched.delete(icao24);
    }

    unwatchAll(): void {
        this.watched.clear();
    }

    isWatched(icao24: string): boolean {
        return this.watched.has(icao24);
    }

    getAll(): string[] {
        return Array.from(this.watched);
    }
}
