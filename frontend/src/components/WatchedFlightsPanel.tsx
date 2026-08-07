import { useCallback, useMemo } from "react";
import type { FlightRecord } from "../types/FlightRecord";

interface UniqueAircraft {
    icao24: string;
    callsign: string | null;
    count: number;
    firstSeen: string;
    lastSeen: string;
}

function groupByAircraft(records: FlightRecord[]): UniqueAircraft[] {
    const map = new Map<
        string,
        { callsign: string | null; records: FlightRecord[] }
    >();
    for (const r of records) {
        if (!map.has(r.icao24))
            map.set(r.icao24, { callsign: r.callsign, records: [] });
        map.get(r.icao24)!.records.push(r);
    }
    return Array.from(map.entries()).map(([icao24, data]) => ({
        icao24,
        callsign: data.callsign,
        count: data.records.length,
        firstSeen: data.records[0]!.recordedAt,
        lastSeen: data.records[data.records.length - 1]!.recordedAt,
    }));
}

// Returns the record for a given aircraft whose recordedAt is closest to targetMs.
function closestRecord(
    records: FlightRecord[],
    icao24: string,
    targetMs: number,
): FlightRecord | null {
    const subset = records.filter((r) => r.icao24 === icao24);
    if (!subset.length) return null;
    return subset.reduce((best, curr) => {
        const bd = Math.abs(new Date(best.recordedAt).getTime() - targetMs);
        const cd = Math.abs(new Date(curr.recordedAt).getTime() - targetMs);
        return cd < bd ? curr : best;
    });
}

function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function toInputValue(ms: number) {
    // datetime-local format: YYYY-MM-DDTHH:mm
    const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 16);
}

interface WatchedFlightsPanelProps {
    isOpen: boolean;
    onToggle: () => void;
    watchedIcao24s: Set<string>;
    onStopWatching: (icao24: string) => void;
    records: FlightRecord[];
    loadingRecords: boolean;
    rangeStartMs: number;
    rangeEndMs: number;
    momentMs: number;
    onRangeStartChange: (ms: number) => void;
    onRangeEndChange: (ms: number) => void;
    onMomentChange: (ms: number) => void;
    onApplyRange: () => void;
    onFlyToRecord: (record: FlightRecord) => void;
    isFilterPanelOpen: boolean;
}

export function WatchedFlightsPanel({
    isOpen,
    onToggle,
    watchedIcao24s,
    onStopWatching,
    records,
    loadingRecords,
    rangeStartMs,
    rangeEndMs,
    momentMs,
    onRangeStartChange,
    onRangeEndChange,
    onMomentChange,
    onApplyRange,
    onFlyToRecord,
    isFilterPanelOpen,
}: WatchedFlightsPanelProps) {
    const aircraft = useMemo(() => groupByAircraft(records), [records]);

    const handleAircraftClick = useCallback(
        (icao24: string) => {
            const record = closestRecord(records, icao24, momentMs);
            if (record) onFlyToRecord(record);
        },
        [records, momentMs, onFlyToRecord],
    );

    return (
        <>
            {/* Toggle button — left of Search & Filter */}
            <button
                onClick={onToggle}
                className="absolute bg-white rounded-lg shadow-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all duration-200"
                style={{
                    right: isFilterPanelOpen
                        ? "calc(320px + 160px + 1.5rem + 0.5rem)"
                        : "calc(160px + 1.5rem)",
                    top: "1rem",
                    zIndex: 1001,
                }}
            >
                Saved Flights
                {watchedIcao24s.size > 0 && (
                    <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {watchedIcao24s.size}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl z-1000 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                        <h2 className="font-semibold text-slate-800">
                            Saved Flights
                        </h2>
                        <button
                            onClick={onToggle}
                            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                        >
                            x
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                        {/* Currently watching */}
                        {watchedIcao24s.size > 0 && (
                            <div>
                                <label className="text-sm font-medium text-slate-600">
                                    Currently Watching
                                </label>
                                <ul className="mt-1 space-y-1">
                                    {Array.from(watchedIcao24s).map(
                                        (icao24) => (
                                            <li
                                                key={icao24}
                                                className="flex items-center justify-between rounded border border-green-200 bg-green-50 px-2 py-1.5"
                                            >
                                                <span className="text-sm font-medium text-green-800">
                                                    {icao24}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        onStopWatching(icao24)
                                                    }
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    Stop
                                                </button>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Time range filter */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">
                                Time Range
                            </label>
                            <div className="mt-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 w-8 shrink-0">
                                        From
                                    </span>
                                    <input
                                        type="datetime-local"
                                        value={toInputValue(rangeStartMs)}
                                        onChange={(e) =>
                                            onRangeStartChange(
                                                new Date(
                                                    e.target.value,
                                                ).getTime(),
                                            )
                                        }
                                        className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 w-8 shrink-0">
                                        To
                                    </span>
                                    <input
                                        type="datetime-local"
                                        value={toInputValue(rangeEndMs)}
                                        onChange={(e) =>
                                            onRangeEndChange(
                                                new Date(
                                                    e.target.value,
                                                ).getTime(),
                                            )
                                        }
                                        className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={onApplyRange}
                                    disabled={loadingRecords}
                                    className="w-full rounded bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loadingRecords ? "Loading..." : "Apply"}
                                </button>
                            </div>
                        </div>

                        {/* Moment slider */}
                        {records.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-slate-600">
                                    Current Moment
                                </label>
                                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                                    {fmt(new Date(momentMs).toISOString())}
                                </p>
                                <input
                                    type="range"
                                    min={rangeStartMs}
                                    max={rangeEndMs}
                                    step={1000}
                                    value={momentMs}
                                    onChange={(e) =>
                                        onMomentChange(Number(e.target.value))
                                    }
                                    className="mt-1 w-full accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                                    <span>
                                        {fmt(
                                            new Date(
                                                rangeStartMs,
                                            ).toISOString(),
                                        )}
                                    </span>
                                    <span>
                                        {fmt(
                                            new Date(rangeEndMs).toISOString(),
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Aircraft list */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">
                                Aircraft in Range
                                {aircraft.length > 0 && (
                                    <span className="ml-2 text-xs text-slate-400">
                                        ({aircraft.length})
                                    </span>
                                )}
                            </label>
                            {loadingRecords && (
                                <p className="mt-1 text-xs text-slate-400">
                                    Loading...
                                </p>
                            )}
                            {!loadingRecords && aircraft.length === 0 && (
                                <p className="mt-1 text-xs text-slate-400">
                                    No records in this range.
                                </p>
                            )}
                            <ul className="mt-1 space-y-1">
                                {aircraft.map((a) => (
                                    <li key={a.icao24}>
                                        <button
                                            onClick={() =>
                                                handleAircraftClick(a.icao24)
                                            }
                                            className="w-full text-left rounded border border-slate-200 px-2 py-2 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-800">
                                                    {a.callsign?.trim() ||
                                                        a.icao24}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {a.count} pts
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {fmt(a.firstSeen)} —{" "}
                                                {fmt(a.lastSeen)}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
