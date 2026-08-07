import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { FlightPosition } from "../types/flight";
import { AircraftMarker } from "./AircraftMarker";

interface AircraftClusterLayerProps {
    flights: FlightPosition[];
    onSelect: (icao24: string) => void;
    bookmarkedIcao24: Set<string>;
    onBookmark: (
        icao24: string,
        callsign: string | null,
        category: number,
    ) => void;
    watchedIcao24s: Set<string>;
    onToggleWatch: (icao24: string) => void;
}

export function AircraftClusterLayer({
    flights,
    onSelect,
    bookmarkedIcao24,
    onBookmark,
    onToggleWatch,
    watchedIcao24s,
}: AircraftClusterLayerProps) {
    const groupRef = useRef<L.MarkerClusterGroup | null>(null);

    useEffect(() => {
        groupRef.current?.refreshClusters();
    });

    return (
        <MarkerClusterGroup
            ref={groupRef}
            chunkedLoading
            spiderfyOnMaxZoom={false}
            disableClusteringAtZoom={9}
            maxClusterRadius={60}
        >
            {flights.map((flight) => (
                <AircraftMarker
                    key={flight.icao24}
                    flight={flight}
                    onSelect={onSelect}
                    isBookmarked={bookmarkedIcao24.has(flight.icao24)}
                    onBookmark={onBookmark}
                    isWatched={watchedIcao24s.has(flight.icao24)}
                    onToggleWatch={onToggleWatch}
                />
            ))}
        </MarkerClusterGroup>
    );
}
