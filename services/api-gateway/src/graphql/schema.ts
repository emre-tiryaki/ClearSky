export const typeDefs = `
    type FlightPosition {
        icao24: String!
        callsign: String
        longitude: Float!
        latitude: Float!
        altitude: Float
        speed: Float
        heading: Float
        onGround: Boolean!
        verticalRate: Float
        timestamp: String!
    }

    type Query {
        _health: String!
    }

    type Subscription {
        liveFlights: FlightPosition!
    }
`;