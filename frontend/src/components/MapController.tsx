import { Map as LeafletMap } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapControllerProps {
    onMapReady: (map: LeafletMap) => void;
}

export function MapController({ onMapReady }: MapControllerProps) {
    const map = useMap();

    useEffect(() => {
        onMapReady(map);
    }, [map, onMapReady]);

    return null;
}
