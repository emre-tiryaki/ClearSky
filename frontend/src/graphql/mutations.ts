export const SAVE_FLIGHT_RECORD_MUTATION = `
  mutation SaveFlightRecord($input: SaveFlightRecordInput!) {
    saveFlightRecord(input: $input) {
      id
      icao24
      savedAt
      note
    }
  }
`;

export const BOOKMARK_FLIGHT_MUTATION = `
  mutation BookmarkFlight($icao24: String!, $callsign: String, $category: Int!) {
    bookmarkFlight(icao24: $icao24, callsign: $callsign, category: $category) {
      id
      icao24
      callsign
      category
      createdAt
    }
  }
`;
export const REMOVE_BOOKMARK_MUTATION = `
  mutation RemoveBookmark($icao24: String!) {
    removeBookmark(icao24: $icao24)
  }
`;

export const WATCH_FLIGHT_MUTATION = `
  mutation WatchFlight($icao24: String!) {
    watchFlight(icao24: $icao24)
  }
`;

export const UNWATCH_FLIGHT_MUTATION = `
  mutation UnwatchFlight($icao24: String!) {
    unwatchFlight(icao24: $icao24)
  }
`;

export const UNWATCH_ALL_MUTATION = `
  mutation UnwatchAll {
    unwatchAll
  }
`;