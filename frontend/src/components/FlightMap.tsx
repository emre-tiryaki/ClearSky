import { Map as LeafletMap } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import type { BoundingBox, FlightPosition } from "../types/flight";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlightTrail } from "./FlightTrail";
import { useSaveFlightRecord } from "../hooks/useSaveFlightRecord";
import { SaveFlightPanel } from "./SaveFlightPanel";
import { useFlightHistory } from "../hooks/useFlightHistory";
import { FlightHistoryRoute } from "./FlightHistoryRoute";
import { MapViewportSync } from "./MapViewportSync";
import type { TrailPoint } from "../types/trail";
import { AircraftClusterLayer } from "./AircraftClusterLayer";
import { DEFAULT_FILTERS, type FlightFilters } from "../types/filters";
import { SearchFilterPanel } from "./SearchFilterPanel";
import { MapController } from "./MapController";
import { filterFlights } from "../utils/searchFlight";
import { useBookmarks } from "../hooks/useBookmarks";
import { useWatchedFlights } from "../hooks/useWatchedFlights";
import { WatchedFlightsPanel } from "./WatchedFlightsPanel";
import type { FlightRecord } from "../types/FlightRecord";

interface FlightMapProps {
    flights: Map<string, FlightPosition>;
    trails: Map<string, TrailPoint[]>;
    bbox: BoundingBox;
    onBoundsChange: (bbox: BoundingBox) => void;
    onVisibleCountChange?: (count: number) => void;
}

const TURKEY_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;
const FLY_TO_ZOOM = 9;
const FILTER_PANEL_WIDTH = 320;

// Converts a persisted FlightRecord into the FlightPosition shape expected by the map layer.
function recordToPosition(r: FlightRecord): FlightPosition {
    return {
        icao24: r.icao24,
        callsign: r.callsign,
        latitude: r.latitude,
        longitude: r.longitude,
        altitude: r.altitude,
        speed: r.velocity,
        heading: r.heading,
        onGround: r.onGround,
        verticalRate: r.verticalRate,
        timestamp: r.recordedAt,
        category: r.category,
    };
}

// For each unique aircraft in records, returns the record whose timestamp is closest to momentMs.
function positionsAtMoment(records: FlightRecord[], momentMs: number): FlightPosition[] {
    const byAircraft = new Map<string, FlightRecord>();
    for (const r of records) {
        const existing = byAircraft.get(r.icao24);
        if (!existing) {
            byAircraft.set(r.icao24, r);
            continue;
        }
        const ed = Math.abs(new Date(existing.recordedAt).getTime() - momentMs);
        const cd = Math.abs(new Date(r.recordedAt).getTime() - momentMs);
        if (cd < ed) byAircraft.set(r.icao24, r);
    }
    return Array.from(byAircraft.values()).map(recordToPosition);
}

export function FlightMap({ flights, trails, bbox, onBoundsChange, onVisibleCountChange }: FlightMapProps) {
    const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isWatchPanelOpen, setIsWatchPanelOpen] = useState(false);
    const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);

    // Watch panel time range & moment — owned here so FlightMap can derive tracked positions.
    const [rangeStartMs, setRangeStartMs] = useState(() => Date.now() - 6 * 60 * 60 * 1000);
    const [rangeEndMs, setRangeEndMs] = useState(() => Date.now());
    const [momentMs, setMomentMs] = useState(() => Date.now());

    const selectedFlight = selectedIcao24 ? (flights.get(selectedIcao24) ?? null) : null;
    const selectedTrail = selectedIcao24 ? (trails.get(selectedIcao24) ?? []) : [];

    const { save, saving, error } = useSaveFlightRecord();
    const { fetch: fetchHistory, history } = useFlightHistory();
    const { bookmarks, bookmarkedIcao24s, addBookmark, removeBookmark } = useBookmarks();
    const {
        watchedIcao24s,
        records,
        loadingRecords,
        toggleWatch,
        stopWatching,
        savePosition,
        fetchRecords,
    } = useWatchedFlights();

    // Auto-save: fires whenever `flights` updates.
    // Saves a position only when the aircraft's timestamp actually changed.
    const lastSavedTimestamp = useRef<Map<string, string>>(new Map());
    useEffect(() => {
        if (watchedIcao24s.size === 0) return;
        for (const icao24 of watchedIcao24s) {
            const flight = flights.get(icao24);
            if (!flight) continue;
            const prev = lastSavedTimestamp.current.get(icao24);
            if (prev === flight.timestamp) continue;
            lastSavedTimestamp.current.set(icao24, flight.timestamp);
            void savePosition(icao24);
        }
    }, [flights, watchedIcao24s, savePosition]);

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

    const handleFlyToFlight = (icao24: string) => {
        const flight = flights.get(icao24);
        if (!flight || !mapInstance) return;
        mapInstance.flyTo([flight.latitude, flight.longitude], FLY_TO_ZOOM, { duration: 1 });
        setSelectedIcao24(icao24);
    };

    const handleFlyToRecord = useCallback((record: FlightRecord) => {
        if (!mapInstance) return;
        mapInstance.flyTo([record.latitude, record.longitude], FLY_TO_ZOOM, { duration: 1 });
    }, [mapInstance]);

    const handleBookmark = useCallback((icao24: string, callsign: string | null, category: number) => {
        if (bookmarkedIcao24s.has(icao24)) void removeBookmark(icao24);
        else void addBookmark(icao24, callsign, category);
    }, [bookmarkedIcao24s, addBookmark, removeBookmark]);

    const handleApplyRange = useCallback(() => {
        void fetchRecords(
            new Date(rangeStartMs).toISOString(),
            new Date(rangeEndMs).toISOString(),
        );
    }, [rangeStartMs, rangeEndMs, fetchRecords]);

    // When the watch panel opens, auto-fetch records for the current range.
    useEffect(() => {
        if (isWatchPanelOpen) handleApplyRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWatchPanelOpen]);

    // In tracked mode (watch panel open), show recorded positions at current moment.
    // In live mode, show the normal filtered & visible live flights.
    const filteredLiveFlights = useMemo(
        () => filterFlights(Array.from(flights.values()), filters),
        [flights, filters]
    );
    const visibleLiveFlights = useMemo(
        () => filteredLiveFlights.filter(f =>
            f.latitude >= bbox.lamin && f.latitude <= bbox.lamax &&
            f.longitude >= bbox.lomin && f.longitude <= bbox.lomax
        ),
        [filteredLiveFlights, bbox]
    );
    const trackedPositions = useMemo(
        () => positionsAtMoment(records, momentMs),
        [records, momentMs]
    );

    const displayedFlights = isWatchPanelOpen ? trackedPositions : visibleLiveFlights;

    useEffect(() => {
        if (!isWatchPanelOpen) onVisibleCountChange?.(visibleLiveFlights.length);
    }, [visibleLiveFlights, isWatchPanelOpen, onVisibleCountChange]);

    const panelOffset = isFilterPanelOpen ? FILTER_PANEL_WIDTH : 0;

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
                <AircraftClusterLayer
                    flights={displayedFlights}
                    onSelect={handleMarkerSelect}
                    bookmarkedIcao24={bookmarkedIcao24s}
                    onBookmark={handleBookmark}
                    watchedIcao24s={watchedIcao24s}
                    onToggleWatch={toggleWatch}
                />
                <MapViewportSync onBoundsChange={onBoundsChange} />
                <MapController onMapReady={setMapInstance} />
                {!isWatchPanelOpen && <FlightTrail points={selectedTrail} />}
                {!isWatchPanelOpen && <FlightHistoryRoute records={history} />}
            </MapContainer>

            <WatchedFlightsPanel
                isOpen={isWatchPanelOpen}
                onToggle={() => setIsWatchPanelOpen(o => !o)}
                watchedIcao24s={watchedIcao24s}
                onStopWatching={stopWatching}
                records={records}
                loadingRecords={loadingRecords}
                rangeStartMs={rangeStartMs}
                rangeEndMs={rangeEndMs}
                momentMs={momentMs}
                onRangeStartChange={setRangeStartMs}
                onRangeEndChange={setRangeEndMs}
                onMomentChange={setMomentMs}
                onApplyRange={handleApplyRange}
                onFlyToRecord={handleFlyToRecord}
            />

            <SearchFilterPanel
                flights={Array.from(flights.values())}
                filters={filters}
                onFiltersChange={setFilters}
                onSelectFlight={handleFlyToFlight}
                isOpen={isFilterPanelOpen}
                onToggle={() => setIsFilterPanelOpen(o => !o)}
                bookmarks={bookmarks}
                onRemoveBookmark={icao24 => void removeBookmark(icao24)}
            />

            {selectedFlight && (
                <SaveFlightPanel
                    flight={selectedFlight}
                    saving={saving}
                    error={error}
                    onSave={handleSave}
                    onClose={() => setSelectedIcao24(null)}
                    panelOffset={panelOffset}
                />
            )}
        </div>
    );
}