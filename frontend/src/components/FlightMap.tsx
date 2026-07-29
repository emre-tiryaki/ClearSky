import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { BoundingBox, FlightPosition } from "../types/flight";
import { getPlaneIcon } from "./FlightMarkerIcon";
import "leaflet/dist/leaflet.css";
import type { TrailPoint } from "../types/trail";
import { useEffect, useState } from "react";
import { FlightTrail } from "./FlightTrail";
import { useSaveFlightRecord } from "../hooks/useSaveFlightRecord";
import { SaveFlightPanel } from "./SaveFlightPanel";
import { useFlightHistory } from "../hooks/useFlightHistory";
import { FlightHistoryRoute } from "./FlightHistoryRoute";
import { MapViewportSync } from "./MapViewportSync";
import { getCategoryName } from "../utils/categoryMapper";

interface FlightMapProps {
    flights: Map<string, FlightPosition>;
    trails: Map<string, TrailPoint[]>;
    onBoundsChange: (bbox: BoundingBox) => void;
}

const TURKEY_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

// Full-screen Leaflet map that renders aircraft markers with heading-rotated icons,
// live trail polylines, historical route overlays, and a save-flight side panel.
export function FlightMap({ flights, trails, onBoundsChange }: FlightMapProps) {
    const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
    const selectedTrail = selectedIcao24
        ? (trails.get(selectedIcao24) ?? [])
        : [];
    const selectedFlight = selectedIcao24
        ? (flights.get(selectedIcao24) ?? null)
        : null;
    const { save, saving, error } = useSaveFlightRecord();
    const {fetch: fetchHistory, history} = useFlightHistory();

    const handleSave = async (note: string) => {
        if (!selectedIcao24) return;

        await save(selectedIcao24, note);
        setSelectedIcao24(null);
    };

    useEffect(() => {
        if (selectedIcao24) fetchHistory(selectedIcao24);
    }, [selectedIcao24, fetchHistory])

    return (
        <div style={{height: "100%", width: "100%", position: "relative"}}>
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
                        icon={getPlaneIcon(flight.heading, flight.onGround, flight.category, flight.altitude, flight.speed)}
                        eventHandlers={{
                            click: () => setSelectedIcao24(flight.icao24),
                        }}
                    >
                        <Popup>
                            <strong>
                                {flight.callsign?.trim() || flight.icao24}
                            </strong>
                            <div>ICAO24: {flight.icao24}</div>
                            <div>
                                altitude:{" "}
                                {flight.altitude != null
                                    ? `${Math.round(flight.altitude)} m`
                                    : "-"}
                            </div>
                            <div>
                                speed:{" "}
                                {flight.speed != null
                                    ? `${Math.round(flight.speed)} m/s`
                                    : "-"}
                            </div>
                            <div>
                                heading:{" "}
                                {flight.heading != null
                                    ? `${Math.round(flight.heading)}°`
                                    : "-"}
                            </div>
                            <div>
                                On gorund: {flight.onGround ? `Yes` : "No"}
                            </div>
                            <div>
                                Category: {getCategoryName(flight.category)}
                                <span style={{color: "#6b7280", fontSize: '0.8em', marginLeft: '4px'}}>
                                    Code: {flight.category}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                <MapViewportSync onBoundsChange={onBoundsChange}/>
                <FlightTrail points={selectedTrail} />
                <FlightHistoryRoute records={history}/>
            </MapContainer>

            {selectedFlight && (
                <SaveFlightPanel
                    flight={selectedFlight}
                    saving={saving}
                    error={error}
                    onSave={handleSave}
                    onClose={() => setSelectedIcao24(null)}
                />
            )}
        </div>
    );
}
