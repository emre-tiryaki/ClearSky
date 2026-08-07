import { Map as LeafletMap } from "leaflet";
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
import { DEFAULT_FILTERS, type FlightFilters } from "../types/filters";
import { SearchFilterPanel } from "./SearchFilterPanel";
import { MapController } from "./MapController";
import { filterFlights } from "../utils/searchFlight";
import { useBookmarks } from "../hooks/useBookmarks";
import { useWatchedFlights } from "../hooks/useWatchedFlights";
import { WatchedFlightsPanel } from "./WatchedFlightsPanel";
import { RecordedRoutes } from "./RecordedRoutes";
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

function interpolateNumber(
    a: number | null | undefined,
    b: number | null | undefined,
    t: number,
): number | null {
    if (a == null && b == null) return null;
    if (a == null) return b!;
    if (b == null) return a;
    return a + (b - a) * t;
}

function interpolateHeading(
    h1: number | null,
    h2: number | null,
    t: number,
): number | null {
    if (h1 == null && h2 == null) return null;
    if (h1 == null) return h2!;
    if (h2 == null) return h1;

    let diff = (h2 - h1) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    let result = (h1 + diff * t) % 360;
    if (result < 0) result += 360;
    return result;
}

// Linearly interpolates aircraft positions between recorded data points for the given moment.
function positionsAtMoment(
    records: FlightRecord[],
    momentMs: number,
): FlightPosition[] {
    const byAircraft = new Map<string, FlightRecord[]>();
    for (const r of records) {
        if (!byAircraft.has(r.icao24)) byAircraft.set(r.icao24, []);
        byAircraft.get(r.icao24)!.push(r);
    }

    const result: FlightPosition[] = [];

    for (const [, recs] of byAircraft.entries()) {
        if (recs.length === 0) continue;

        const sorted = [...recs].sort(
            (a, b) =>
                new Date(a.recordedAt).getTime() -
                new Date(b.recordedAt).getTime(),
        );

        const firstTime = new Date(sorted[0].recordedAt).getTime();
        const lastTime = new Date(
            sorted[sorted.length - 1].recordedAt,
        ).getTime();

        if (momentMs <= firstTime) {
            result.push(recordToPosition(sorted[0]));
            continue;
        }
        if (momentMs >= lastTime) {
            result.push(recordToPosition(sorted[sorted.length - 1]));
            continue;
        }

        let r1 = sorted[0];
        let r2 = sorted[sorted.length - 1];

        for (let i = 0; i < sorted.length - 1; i++) {
            const t1 = new Date(sorted[i].recordedAt).getTime();
            const t2 = new Date(sorted[i + 1].recordedAt).getTime();
            if (momentMs >= t1 && momentMs <= t2) {
                r1 = sorted[i];
                r2 = sorted[i + 1];
                break;
            }
        }

        const t1 = new Date(r1.recordedAt).getTime();
        const t2 = new Date(r2.recordedAt).getTime();

        if (t1 === t2) {
            result.push(recordToPosition(r1));
            continue;
        }

        const t = (momentMs - t1) / (t2 - t1);

        const lat = r1.latitude + t * (r2.latitude - r1.latitude);
        const lon = r1.longitude + t * (r2.longitude - r1.longitude);
        const altitude = interpolateNumber(r1.altitude, r2.altitude, t);
        const speed = interpolateNumber(r1.velocity, r2.velocity, t);
        const heading = interpolateHeading(r1.heading, r2.heading, t);

        result.push({
            icao24: r1.icao24,
            callsign: r1.callsign ?? r2.callsign,
            latitude: lat,
            longitude: lon,
            altitude,
            speed,
            heading,
            onGround: t < 0.5 ? r1.onGround : r2.onGround,
            verticalRate: interpolateNumber(
                r1.verticalRate,
                r2.verticalRate,
                t,
            ),
            timestamp: new Date(momentMs).toISOString(),
            category: r1.category ?? r2.category,
        });
    }

    return result;
}

export function FlightMap({
    flights,
    trails,
    bbox,
    onBoundsChange,
    onVisibleCountChange,
}: FlightMapProps) {
    const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isWatchPanelOpen, setIsWatchPanelOpen] = useState(false);
    const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);

    // Watch panel time range & moment — owned here so FlightMap can derive tracked positions.
    const [rangeStartMs, setRangeStartMs] = useState(
        () => Date.now() - 6 * 60 * 60 * 1000,
    );
    const [rangeEndMs, setRangeEndMs] = useState(() => Date.now());
    const [momentMs, setMomentMs] = useState(() => Date.now());

    const selectedFlight = selectedIcao24
        ? (flights.get(selectedIcao24) ?? null)
        : null;
    const selectedTrail = selectedIcao24
        ? (trails.get(selectedIcao24) ?? [])
        : [];

    const { save, saving, error } = useSaveFlightRecord();
    const { fetch: fetchHistory, history } = useFlightHistory();
    const { bookmarks, bookmarkedIcao24s, addBookmark, removeBookmark } =
        useBookmarks();
    const {
        watchedIcao24s,
        records,
        loadingRecords,
        toggleWatch,
        stopWatching,
        fetchRecords,
    } = useWatchedFlights();

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
        mapInstance.flyTo([flight.latitude, flight.longitude], FLY_TO_ZOOM, {
            duration: 1,
        });
        setSelectedIcao24(icao24);
    };

    const handleFlyToRecord = useCallback(
        (record: FlightRecord) => {
            if (!mapInstance) return;
            mapInstance.flyTo(
                [record.latitude, record.longitude],
                FLY_TO_ZOOM,
                { duration: 1 },
            );
        },
        [mapInstance],
    );

    const handleBookmark = useCallback(
        (icao24: string, callsign: string | null, category: number) => {
            if (bookmarkedIcao24s.has(icao24)) void removeBookmark(icao24);
            else void addBookmark(icao24, callsign, category);
        },
        [bookmarkedIcao24s, addBookmark, removeBookmark],
    );

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

    // Automatically fit the slider range to the exact span of fetched records
    useEffect(() => {
        if (records.length === 0) return;
        const times = records.map((r) => new Date(r.recordedAt).getTime());
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        if (minTime < maxTime) {
            setRangeStartMs(minTime);
            setRangeEndMs(maxTime);
            setMomentMs((prev) =>
                prev < minTime || prev > maxTime ? maxTime : prev,
            );
        }
    }, [records]);

    // In tracked mode (watch panel open), show recorded positions at current moment.
    // In live mode, show the normal filtered & visible live flights.
    const filteredLiveFlights = useMemo(
        () => filterFlights(Array.from(flights.values()), filters),
        [flights, filters],
    );
    const visibleLiveFlights = useMemo(
        () =>
            filteredLiveFlights.filter(
                (f) =>
                    f.latitude >= bbox.lamin &&
                    f.latitude <= bbox.lamax &&
                    f.longitude >= bbox.lomin &&
                    f.longitude <= bbox.lomax,
            ),
        [filteredLiveFlights, bbox],
    );
    const trackedPositions = useMemo(
        () => positionsAtMoment(records, momentMs),
        [records, momentMs],
    );

    const displayedFlights = isWatchPanelOpen
        ? trackedPositions
        : visibleLiveFlights;

    useEffect(() => {
        if (!isWatchPanelOpen)
            onVisibleCountChange?.(visibleLiveFlights.length);
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
                {isWatchPanelOpen && <RecordedRoutes records={records} />}
            </MapContainer>

            <WatchedFlightsPanel
                isOpen={isWatchPanelOpen}
                onToggle={() => setIsWatchPanelOpen((o) => !o)}
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
                onToggle={() => setIsFilterPanelOpen((o) => !o)}
                bookmarks={bookmarks}
                onRemoveBookmark={(icao24) => void removeBookmark(icao24)}
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
