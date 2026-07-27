import { Polyline } from "react-leaflet";
import type { TrailPoint } from "../types/trail";
import { speedToColor } from "../utils/speedColor";

interface FlightTrailProps {
    points: TrailPoint[]
}

export function FlightTrail({points}: FlightTrailProps) {
    if (points.length < 2) return null;

    const speeds = points
        .map(p => p.speed)
        .filter((s): s is number => s !== null);

    const minSpeed = speeds.length ? Math.min(...speeds) : 0;
    const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
    const range = maxSpeed - minSpeed;

    return (
        <>
            {points.slice(1).map((curr, i) => {
                const prev = points[i];
                const speed = curr.speed ?? prev.speed ?? minSpeed;
                const t = range > 0 ? (speed - minSpeed) / range : 0.5;

                return (
                    <Polyline 
                        key={curr.timestamp}
                        positions={[[prev.lat, prev.lon], [curr.lat, curr.lon]]}
                        pathOptions={{color: speedToColor(t), weight: 3, opacity: 0.85}}
                    />
                )
            })}
        </>
    )
}