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