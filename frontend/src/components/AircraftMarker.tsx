import { Marker, Popup } from "react-leaflet";
import { getPlaneIcon } from "./FlightMarkerIcon";
import { getCategoryName } from "../utils/categoryMapper";
import { memo } from "react";
import type { FlightPosition } from "../types/flight";

interface AircraftMarkerProps {
    flight: FlightPosition;
    onSelect: (icao24: string) => void;
}

function AircraftMarkerComponent({flight, onSelect}: AircraftMarkerProps) {
    return (
        <Marker
            position={[flight.latitude, flight.longitude]}
            icon={getPlaneIcon(flight.heading, flight.onGround, flight.category, flight.altitude, flight.speed)}
            eventHandlers={{
                click: () => onSelect(flight.icao24),
            }}
        >
            <Popup>
                <strong>{flight.callsign?.trim() || flight.icao24}</strong>
                <div>ICAO24: {flight.icao24}</div>
                <div>
                    altitude: {flight.altitude != null ? `${Math.round(flight.altitude)} m` : "-"}
                </div>
                <div>
                    speed: {flight.speed != null ? `${Math.round(flight.speed)} m/s` : "-"}
                </div>
                <div>
                    heading: {flight.heading != null ? `${Math.round(flight.heading)}°` : "-"}
                </div>
                <div>On ground: {flight.onGround ? "Yes" : "No"}</div>
                <div>
                    Category: {getCategoryName(flight.category)}
                    <span style={{ color: "#6b7280", fontSize: "0.8em", marginLeft: "4px" }}>
                        Code: {flight.category}
                    </span>
                </div>
            </Popup>
        </Marker>
    );
}

export const AircraftMarker = memo(AircraftMarkerComponent);