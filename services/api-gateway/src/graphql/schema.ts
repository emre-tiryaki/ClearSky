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

    input BoundingBoxInput {
        lamin: Float!
        lomin: Float!
        lamax: Float!
        lomax: Float!
    }

    type Query {
        _health: String!
    }

    type Subscription {
        liveFlights(bbox: BoundingBoxInput!): FlightPosition!
    }
`;