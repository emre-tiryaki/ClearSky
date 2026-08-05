import { Marker, Popup } from "react-leaflet";
import { getPlaneIcon } from "./FlightMarkerIcon";
import { getCategoryName } from "../utils/categoryMapper";
import { memo } from "react";
import type { FlightPosition } from "../types/flight";

interface AircraftMarkerProps {
    flight: FlightPosition;
    onSelect: (icao24: string) => void;
    isBookmarked: boolean;
    onBookmark: (icao24: string, callsign: string | null, category: number) => void;
}

function AircraftMarkerComponent({flight, onSelect, isBookmarked, onBookmark}: AircraftMarkerProps) {
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
                <div style={{marginTop: "8px"}}>
                    <button 
                        onClick={() => onBookmark(flight.icao24, flight.callsign, flight.category)}
                        style={{
                            padding: "4px 10px",
                            fontSize: "0.8em",
                            borderRadius: "4px",
                            border: "1px solid",
                            cursor: "pointer",
                            backgroundColor: isBookmarked ? "#1d4ed8" : "white",
                            color: isBookmarked ? "white" : "#374151",
                            borderColor: isBookmarked ? "#1d4ed8" : "#d1d5db",
                        }}
                    >
                        {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </button>
                </div>
            </Popup>
        </Marker>
    );
}

export const AircraftMarker = memo(AircraftMarkerComponent);