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