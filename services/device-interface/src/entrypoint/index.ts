import type { FlightPosition } from '../../../../shared/index.js';

const sampleFlightPosition: FlightPosition = {
	icao24: '4b1800',
	callsign: 'THY123',
	longitude: 28.9784,
	latitude: 41.0082,
	altitude: 11000,
	speed: 230,
	heading: 180,
	onGround: false,
	verticalRate: 0,
	timestamp: new Date(),
};

console.log('Shared FlightPosition type is available:', sampleFlightPosition.icao24);

