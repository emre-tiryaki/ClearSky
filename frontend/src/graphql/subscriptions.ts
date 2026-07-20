export const LIVE_FLIGHTS_SUBSCRIPTION = `
  subscription LiveFlights($bbox: BoundingBoxInput!) {
    liveFlights(bbox: $bbox) {
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