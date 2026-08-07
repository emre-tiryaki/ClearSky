import type { LatLngBounds } from "leaflet";
import type { BoundingBox } from "../types/flight";
import { useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";

interface MapViewportSyncProps {
    onBoundsChange: (bbox: BoundingBox) => void;
}

function boundsToBBox(bounds: LatLngBounds): BoundingBox {
    return {
        lamin: bounds.getSouth(),
        lamax: bounds.getNorth(),
        lomin: bounds.getWest(),
        lomax: bounds.getEast(),
    };
}

// Invisible helper component that reports the map's bounding box
// on initial mount and after every pan/zoom event.
export function MapViewportSync({ onBoundsChange }: MapViewportSyncProps) {
    const map = useMap();

    useEffect(() => {
        onBoundsChange(boundsToBBox(map.getBounds()));
    }, []);

    useMapEvents({
        moveend: (e) => onBoundsChange(boundsToBBox(e.target.getBounds())),
    });

    return null;
}
