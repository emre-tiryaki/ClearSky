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