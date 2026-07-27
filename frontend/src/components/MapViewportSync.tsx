import type { LatLngBounds } from "leaflet";
import type { BoundingBox } from "../types/fligt";
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

export function MapViewportSync({onBoundsChange}: MapViewportSyncProps) {
    const map = useMap();

    useEffect(() => {
        onBoundsChange(boundsToBBox(map.getBounds()));
    }, []);

    useMapEvents({
        moveend: (e) => onBoundsChange(boundsToBBox(e.target.getBounds())),
    });

    return null;
}