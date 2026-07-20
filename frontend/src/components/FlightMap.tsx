import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { FlightPosition } from "../types/fligt";
import { getPlaneIcon } from "./FlightMarkerIcon";
import "leaflet/dist/leaflet.css";


interface FlightMapProps {
    flights: Map<string, FlightPosition>;
}

const TURKEY_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

export function FlightMap({flights}: FlightMapProps) {
    return (
        <MapContainer
            center={TURKEY_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{height:"100%", width:"100%"}}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Array.from(flights.values()).map(flight => (
                <Marker
                    key={flight.icao24}
                    position={[flight.latitude, flight.longitude]}
                    icon={getPlaneIcon(flight.heading, flight.onGround)}
                >
                    <Popup>
                        <strong>{flight.callsign?.trim() || flight.icao24}</strong>
                        <div>ICAO24: {flight.icao24}</div>
                        <div>altitude: {flight.altitude != null ? `${Math.round(flight.altitude)} m` : "-"}</div>
                        <div>speed: {flight.speed != null ? `${Math.round(flight.speed)} km/h` : "-"}</div>
                        <div>heading: {flight.heading != null ? `${Math.round(flight.heading)}°` : "-"}</div>
                        <div>On gorund: {flight.onGround? `Yes` : "No"}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}