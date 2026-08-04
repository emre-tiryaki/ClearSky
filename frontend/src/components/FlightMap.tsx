import { MapContainer, TileLayer } from "react-leaflet";
import type { BoundingBox, FlightPosition } from "../types/flight";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlightTrail } from "./FlightTrail";

import { useSaveFlightRecord } from "../hooks/useSaveFlightRecord";
import { SaveFlightPanel } from "./SaveFlightPanel";
import { useFlightHistory } from "../hooks/useFlightHistory";
import { FlightHistoryRoute } from "./FlightHistoryRoute";
import { MapViewportSync } from "./MapViewportSync";
import type { TrailPoint } from "../types/trail";
import { AircraftClusterLayer } from "./AircraftClusterLayer";

interface FlightMapProps {
    flights: Map<string, FlightPosition>;
    trails: Map<string, TrailPoint[]>;
    bbox: BoundingBox;
    onBoundsChange: (bbox: BoundingBox) => void;
    onVisibleCountChange?: (count: number) => void;
}

const TURKEY_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

export function FlightMap({ flights, trails, bbox, onBoundsChange, onVisibleCountChange }: FlightMapProps) {
    const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
    const selectedFlight = selectedIcao24 ? (flights.get(selectedIcao24) ?? null) : null;
    const selectedTrail = selectedIcao24 ? (trails.get(selectedIcao24) ?? []) : [];

    const { save, saving, error } = useSaveFlightRecord();
    const { fetch: fetchHistory, history } = useFlightHistory();

    const handleSave = async (note: string) => {
        if (!selectedIcao24) return;
        await save(selectedIcao24, note);
        setSelectedIcao24(null);
    };

    useEffect(() => {
        if (selectedIcao24) fetchHistory(selectedIcao24);
    }, [selectedIcao24, fetchHistory]);

    const handleMarkerSelect = useCallback((icao24: string) => {
        setSelectedIcao24(icao24);
    }, []);

    const visibleFlights = useMemo(
        () => Array.from(flights.values()).filter(f =>
            f.latitude >= bbox.lamin && f.latitude <= bbox.lamax &&
            f.longitude >= bbox.lomin && f.longitude <= bbox.lomax
        ),
        [flights, bbox]
    );

    useEffect(() => {
        onVisibleCountChange?.(visibleFlights.length);
    }, [visibleFlights, onVisibleCountChange]);

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <MapContainer
                center={TURKEY_CENTER}
                zoom={DEFAULT_ZOOM}
                preferCanvas={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <AircraftClusterLayer flights={visibleFlights} onSelect={handleMarkerSelect}/>
                <MapViewportSync onBoundsChange={onBoundsChange} />
                <FlightTrail points={selectedTrail} />
                <FlightHistoryRoute records={history} />
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