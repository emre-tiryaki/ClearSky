import { useCallback, useEffect, useState } from "react";
import type { Bookmark } from "../types/Bookmark";
import { executeGraphQLOperation } from "../graphql/httpClient";
import { BOOKMARKS_QUERY } from "../graphql/queries";
import { BOOKMARK_FLIGHT_MUTATION, REMOVE_BOOKMARK_MUTATION } from "../graphql/mutations";

interface BookmarsResult {
    bookmarks: Bookmark[];
}

interface BookmarkFlightResult {
    bookmarkFlight: Bookmark;
}

// Manages the bookmarks list. fetches from mongodb on mount, adds and removes bookmarks
export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBookmarks = useCallback(async () => {
        setLoading(true);

        try {
            const result = await executeGraphQLOperation<BookmarsResult>(BOOKMARKS_QUERY, {});
            setBookmarks(result.bookmarks);
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        void (async () => {
            await Promise.resolve();
            await fetchBookmarks();
        })();
    }, [fetchBookmarks]);

    const addBookmark = useCallback(async (
        icao24: string,
        callsign: string | null,
        category: number,
    ) => {
        const result = await executeGraphQLOperation<BookmarkFlightResult>(
            BOOKMARK_FLIGHT_MUTATION,
            {icao24, callsign, category},
        );
        setBookmarks(prev => {
            const exists = prev.some(b => b.icao24 === icao24);
            if (exists) return prev.map(b => b.icao24 === icao24 ? result.bookmarkFlight : b);
            return [...prev, result.bookmarkFlight];
        })
    }, []);

    const removeBookmark = useCallback(async (icao24: string) => {
        await executeGraphQLOperation(REMOVE_BOOKMARK_MUTATION, {icao24});
        setBookmarks(prev => prev.filter(b => b.icao24 !== icao24));
    }, []);

    const bookmarkedIcao24s = new Set(bookmarks.map(b => b.icao24));

    return {bookmarks, bookmarkedIcao24s, loading, addBookmark, removeBookmark}
}