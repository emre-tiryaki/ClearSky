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
        category: Int!
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

    type FlightRecord {
        id: ID!
        icao24: String!
        callsign: String
        latitude: Float!
        longitude: Float!
        altitude: Float
        velocity: Float
        heading: Float
        verticalRate: Float
        onGround: Boolean!
        recordedAt: String!
        savedAt: String!
        note: String
        category: Int!
    }

    input SaveFlightRecordInput {
        icao24: String!
        note: String
    }

    type Query {
        _health: String!
        flightRecords(startDate: String!, endDate: String!): [FlightRecord!]!
        flightHistory(icao24: String!): [FlightRecord!]!
    }

    type Mutation {
        saveFlightRecord(input: SaveFlightRecordInput!): FlightRecord!
    }

    type Subscription {
        liveFlights(bbox: BoundingBoxInput!): FlightPosition!
        systemStatus: SystemStatus!
    }
`;