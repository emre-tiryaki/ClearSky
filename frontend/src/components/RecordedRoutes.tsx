import { Polyline } from "react-leaflet";
import type { FlightRecord } from "../types/FlightRecord";
import { speedToColor } from "../utils/speedColor";
import { useMemo } from "react";

// Deterministic palette for distinguishing multiple aircraft by color.
const ROUTE_COLORS = [
    "#2563eb", // blue
    "#dc2626", // red
    "#16a34a", // green
    "#d97706", // amber
    "#7c3aed", // violet
    "#0891b2", // cyan
    "#be185d", // pink
    "#65a30d", // lime
];

interface RecordedRoutesProps {
    records: FlightRecord[];
}

// Groups records by icao24 and renders each aircraft's recorded path as
// a speed-colored, dashed polyline on the map.
export function RecordedRoutes({ records }: RecordedRoutesProps) {
    const grouped = useMemo(() => {
        const map = new Map<string, FlightRecord[]>();
        for (const r of records) {
            if (!map.has(r.icao24)) map.set(r.icao24, []);
            map.get(r.icao24)!.push(r);
        }
        return map;
    }, [records]);

    return (
        <>
            {Array.from(grouped.entries()).map(([icao24, recs], groupIdx) => {
                if (recs.length < 2) return null;

                const speeds = recs
                    .map((r) => r.velocity)
                    .filter((s): s is number => s != null);
                const minSpeed = speeds.length ? Math.min(...speeds) : 0;
                const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
                const range = maxSpeed - minSpeed;

                const fallbackColor =
                    ROUTE_COLORS[groupIdx % ROUTE_COLORS.length];

                return recs.slice(1).map((curr, i) => {
                    const prev = recs[i];
                    const speed = curr.velocity ?? prev.velocity ?? minSpeed;
                    const t = range > 0 ? (speed - minSpeed) / range : 0.5;

                    return (
                        <Polyline
                            key={`${icao24}-${i}`}
                            positions={[
                                [prev.latitude, prev.longitude],
                                [curr.latitude, curr.longitude],
                            ]}
                            pathOptions={{
                                color:
                                    range > 0 ? speedToColor(t) : fallbackColor,
                                weight: 3,
                                opacity: 0.8,
                                dashArray: "6 4",
                            }}
                        />
                    );
                });
            })}
        </>
    );
}
