import { Polyline } from "react-leaflet";
import type { FlightRecord } from "../types/FlightRecord";
import { speedToColor } from "../utils/speedColor";

interface FlightHistoryRouteProps {
    records: FlightRecord[];
}

// Renders historical flight path as a dashed, speed-colored polyline
// using persisted FlightRecord data fetched from the database.
export function FlightHistoryRoute({records}: FlightHistoryRouteProps) {
    if (records.length < 2) return null;

    const speeds = records.map(r => r.velocity). filter((s): s is number => s !== null);
    const minSpeed = speeds.length ? Math.min(...speeds) : 0;
    const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
    const range = maxSpeed - minSpeed;

    return (
        <>
            {records.slice(1).map((curr, i) => {
                const prev = records[i];
                const speed = curr.velocity ?? prev.velocity ?? minSpeed;
                const t = range > 0 ? (speed - minSpeed) / range : 0.5;

                return (
                    <Polyline 
                        key={curr.id}
                        positions={[[prev.latitude, prev.longitude], [curr.latitude, curr.longitude]]}
                        pathOptions={{color: speedToColor(t), weight: 3, opacity: 0.85, dashArray: "4 4"}}
                    />
                )
            })}
        </>
    )
}