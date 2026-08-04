import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { FlightPosition } from "../types/flight";
import { AircraftMarker } from "./AircraftMarker";


interface AircraftClusterLayerProps {
    flights: FlightPosition[];
    onSelect: (icao24: string) => void;
}

export function AircraftClusterLayer({flights, onSelect}: AircraftClusterLayerProps) {
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
            {flights.map(flight => (
                <AircraftMarker key={flight.icao24} flight={flight} onSelect={onSelect}/>
            ))}
        </MarkerClusterGroup>
    )
}