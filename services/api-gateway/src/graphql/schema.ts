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

    type SystemStatus {
        type: String!
        message: String!
        retryAfterSeconds: Int
        timestamp: String!
    }

    input BoundingBoxInput {
        lamin: Float!
        lomin: Float!
        lamax: Float!
        lomax: Float!
    }

    input SaveFlightRecordInput {
        icao24: String!
        note: String
    }

    type Query {
        _health: String!
    }

    type Mutation {
        saveFlightRecord(input: SaveFlightRecordInput!): FlightRecord!
    }

    type Subscription {
        liveFlights(bbox: BoundingBoxInput!): FlightPosition!
        systemStatus: SystemStatus!
    }
`;