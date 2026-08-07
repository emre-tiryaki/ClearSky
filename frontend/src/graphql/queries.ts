export const SYSTEM_STATUS_SUBSCRIPTION = `
  subscription SystemStatus {
    systemStatus {
      type
      message
      retryAfterSeconds
      timestamp
    }
  }
`;

export const FLIGHT_RECORDS_QUERY = `
  query FlightRecords($startDate: String!, $endDate: String!) {
    flightRecords(startDate: $startDate, endDate: $endDate) {
      id
      icao24
      callsign
      latitude
      longitude
      altitude
      velocity
      heading
      verticalRate
      onGround
      recordedAt
      note
      category
    }
  }
`;

export const FLIGHT_HISTORY_QUERY = `
  query FlightHistory($icao24: String!) {
    flightHistory(icao24: $icao24) {
      id
      latitude
      longitude
      velocity
      recordedAt
    }
  }
`;

export const BOOKMARKS_QUERY = `
  query Bookmarks {
    bookmarks {
      id
      icao24
      callsign
      category
      createdAt
    }
  }
`;

export const WATCHED_ICAO24S_QUERY = `
  query WatchedIcao24s {
    watchedIcao24s
  }
`;