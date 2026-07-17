import type { FlightPosition } from "../types/FlightPosition";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet"

interface FlightMapProps {
    flights: Map<string, FlightPosition>;
}

const TURKEY_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

function createPlaneIcon(heading: number | null, onGround: boolean): L.DivIcon {
    const rotation = heading ?? 0;
    const color = onGround ? "#9ca3af" : "#2563eb";

    return L.divIcon({
        className: "flight-marker",
        html: `
      <svg width="22" height="22" viewBox="0 0 24 24" style="transform: rotate(${rotation}deg);">
        <path d="M12 2L15 9L22 12L15 13L14 20L12 17L10 20L9 13L2 12L9 9L12 2Z"
          fill="${color}" stroke="#1e3a8a" stroke-width="0.5" />
      </svg>
    `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });
}

export function FlightMap({ flights }: FlightMapProps) {
    return (
        <MapContainer
            center={TURKEY_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Array.from(flights.values()).map((flight) => (
                <Marker
                    key={flight.icao24}
                    position={[flight.latitude, flight.longitude]}
                    icon={createPlaneIcon(flight.heading, flight.onGround)}
                >
                    <Popup>
                        <strong>
                            {flight.callsign?.trim() || flight.icao24}
                        </strong>
                        <div>ICAO24: {flight.icao24}</div>
                        <div>
                            Altitude:{" "}
                            {flight.altitude != null
                                ? `${Math.round(flight.altitude)} m`
                                : "-"}
                        </div>
                        <div>
                            Speed:{" "}
                            {flight.speed != null
                                ? `${Math.round(flight.speed * 3.6)}`
                                : "-"}
                        </div>
                        <div>
                            Heading{" "}
                            {flight.heading != null
                                ? `${Math.round(flight.heading)}°`
                                : "-"}
                        </div>
                        <div>
                            Is On Ground: {flight.onGround ? "Yes" : "No"}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
