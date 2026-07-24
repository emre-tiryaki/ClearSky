import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { FlightPosition } from "../types/fligt";
import { getPlaneIcon } from "./FlightMarkerIcon";
import "leaflet/dist/leaflet.css";
import type { TrailPoint } from "../types/trail";
import { useState } from "react";
import { FlightTrail } from "./FlightTrail";
import { useSaveFlightRecord } from "../hooks/useSaveFlightRecord";
import { SaveFlightPanel } from "./SaveFlightPanel";

interface FlightMapProps {
    flights: Map<string, FlightPosition>;
    trails: Map<string, TrailPoint[]>;
}

const TURKEY_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

export function FlightMap({ flights, trails }: FlightMapProps) {
    const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
    const selectedTrail = selectedIcao24
        ? (trails.get(selectedIcao24) ?? [])
        : [];
    const selectedFlight = selectedIcao24
        ? (flights.get(selectedIcao24) ?? null)
        : null;
    const { save, saving, error } = useSaveFlightRecord();

    const handleSave = async (note: string) => {
        if (!selectedIcao24) return;

        await save(selectedIcao24, note);
        setSelectedIcao24(null);
    };

    return (
        <div style={{height: "100%", width: "100%"}}>
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
                        icon={getPlaneIcon(flight.heading, flight.onGround)}
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
                                    ? `${Math.round(flight.speed)} km/h`
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
                        </Popup>
                    </Marker>
                ))}
                <FlightTrail points={selectedTrail} />
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
