import { useState } from "react";
import type { FlightPosition } from "../types/flight";

interface SaveFlightPanelProps {
    flight: FlightPosition;
    saving: boolean;
    error: string | null;
    onSave: (note: string) => void;
    onClose: () => void;
}

export function SaveFlightPanel({flight, saving, error, onSave, onClose}: SaveFlightPanelProps) {
    const [note, setNote] = useState("");

    return (
        <div className="absolute right-4 top-16 w-72 rounded-lg bg-white p-4 shadow-lg z-1000">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">{flight.callsign?.trim() || flight.icao24}</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    ✕
                </button>
            </div>

            <dl className="mt-2 text-sm text-slate-600">
                <div>ICAO24 {flight.icao24}</div>
                <div>Altitude: {flight.altitude != null ? `${Math.round(flight.altitude)} m`:"-"}</div>
                <div>Speed: {flight.speed != null ? `${Math.round(flight.speed) * 3.6} km/h`:"-"}</div>
            </dl>

            <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Description (Optional)"
                className="mt-3 w-full rounded border border-slate-300 p-2 text-sm"
                rows={2}
            />
            
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            
            <button
                onClick={() => onSave(note)}
                disabled={saving}
                className="mt-3 w-full rounded bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
                {saving ? "Saving" : "Save"}
            </button>
        </div>
    )
}