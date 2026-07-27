export const LIVE_FLIGHTS_SUBSCRIPTION = `
  subscription LiveFlights {
    liveFlights {
      icao24
      callsign
      longitude
      latitude
      altitude
      speed
      heading
      onGround
      verticalRate
      timestamp
    }
  }
`;

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
      recordedAt
      note
    }
  }
`;

export const FLIGHT_HISTORY_QUERY = `
  query FlightHistory($icao24: String) {
    flightHistory(icao24: $icao24) {
      id
      latitude
      longitude
      velocity
      recordedAt
    }
  }
`;