import { Polyline } from "react-leaflet";
import type { TrailPoint } from "../types/trail";

interface FlightTrailProps {
    points: TrailPoint[]
}

const SLOW_COLOR: [number, number, number] = [37, 99, 235];
const FAST_COLOR: [number, number, number] = [220, 38, 38];

function speedToColor(t: number): string {
    const clamped = Math.min(1, Math.max(0, t));
    const r = Math.round(SLOW_COLOR[0] + (FAST_COLOR[0] - SLOW_COLOR[0]) * clamped);
    const g = Math.round(SLOW_COLOR[1] + (FAST_COLOR[1] - SLOW_COLOR[1]) * clamped);
    const b = Math.round(SLOW_COLOR[2] + (FAST_COLOR[2] - SLOW_COLOR[2]) * clamped);

    return `rgb(${r}, ${g}, ${b})`;
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