import { useMemo, useState } from 'react';
import { useFlightRecords } from '../hooks/useFlightRecords';
import { getCategoryName } from '../utils/categoryMapper';
import type { FlightRecord } from '../types/FlightRecord';

type SortKey =
    | 'icao24'
    | 'category'
    | 'callsign'
    | 'count'
    | 'altitude'
    | 'speed'
    | 'recordedAt'
    | 'note';
type SortDir = 'asc' | 'desc';

interface AircraftGroup {
    icao24: string;
    callsign: string | null;
    category: number;
    count: number;
    firstSeen: string;
    lastSeen: string;
    avgAltitude: number | null;
    avgSpeed: number | null;
    notes: string[];
    records: FlightRecord[];
}

function groupRecords(records: FlightRecord[]): AircraftGroup[] {
    const map = new Map<string, FlightRecord[]>();
    for (const r of records) {
        if (!map.has(r.icao24)) map.set(r.icao24, []);
        map.get(r.icao24)!.push(r);
    }

    return Array.from(map.entries()).map(([icao24, recs]) => {
        const sorted = [...recs].sort(
            (a, b) =>
                new Date(a.recordedAt).getTime() -
                new Date(b.recordedAt).getTime(),
        );

        const altitudes = recs.filter(r => r.altitude != null).map(r => r.altitude!);
        const speeds = recs.filter(r => r.velocity != null).map(r => r.velocity!);
        const notes = [...new Set(recs.map(r => r.note).filter((n): n is string => n != null && n.trim() !== ''))];

        return {
            icao24,
            callsign: recs.find(r => r.callsign)?.callsign ?? null,
            category: recs[0].category,
            count: recs.length,
            firstSeen: sorted[0].recordedAt,
            lastSeen: sorted[sorted.length - 1].recordedAt,
            avgAltitude: altitudes.length > 0 ? altitudes.reduce((a, b) => a + b, 0) / altitudes.length : null,
            avgSpeed: speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : null,
            notes,
            records: sorted,
        };
    });
}

const COLUMNS: { key: SortKey; label: string; width: string }[] = [
    { key: 'icao24', label: 'ICAO24', width: '12%' },
    { key: 'category', label: 'Category', width: '12%' },
    { key: 'callsign', label: 'Callsign', width: '12%' },
    { key: 'count', label: 'Records', width: '8%' },
    { key: 'altitude', label: 'Avg Altitude', width: '11%' },
    { key: 'speed', label: 'Avg Speed', width: '11%' },
    { key: 'recordedAt', label: 'Time Range', width: '22%' },
    { key: 'note', label: 'Notes', width: '12%' },
];

function compareGroups(a: AircraftGroup, b: AircraftGroup, key: SortKey): number {
    switch (key) {
        case 'icao24':
            return a.icao24.localeCompare(b.icao24);
        case 'category':
            return (a.category ?? 0) - (b.category ?? 0);
        case 'callsign':
            return (a.callsign ?? '').localeCompare(b.callsign ?? '');
        case 'count':
            return a.count - b.count;
        case 'altitude':
            return (a.avgAltitude ?? 0) - (b.avgAltitude ?? 0);
        case 'speed':
            return (a.avgSpeed ?? 0) - (b.avgSpeed ?? 0);
        case 'recordedAt':
            return (
                new Date(a.firstSeen).getTime() -
                new Date(b.firstSeen).getTime()
            );
        case 'note':
            return (a.notes[0] ?? '').localeCompare(b.notes[0] ?? '');
        default:
            return 0;
    }
}

function SortIcon({ dir }: { dir: SortDir | null }) {
    if (!dir) {
        return (
            <span className="ml-1 text-slate-300 text-xs select-none">⇅</span>
        );
    }
    return (
        <span className="ml-1 text-blue-600 text-xs select-none">
            {dir === 'asc' ? '↑' : '↓'}
        </span>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Page that lets the user query saved flight records by date range and displays them in a table.
export function ReportPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { records, loading, error, fetch } = useFlightRecords();

    const [sortKey, setSortKey] = useState<SortKey>('recordedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [filterText, setFilterText] = useState('');
    const [expandedIcao24s, setExpandedIcao24s] = useState<Set<string>>(new Set());

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const toggleExpand = (icao24: string) => {
        setExpandedIcao24s(prev => {
            const next = new Set(prev);
            if (next.has(icao24)) next.delete(icao24);
            else next.add(icao24);
            return next;
        });
    };

    const groups = useMemo(() => groupRecords(records), [records]);

    const filteredAndSorted = useMemo(() => {
        let result = groups;

        // Text filter
        const query = filterText.trim().toLowerCase();
        if (query) {
            result = result.filter(
                g =>
                    g.icao24.toLowerCase().includes(query) ||
                    (g.callsign?.toLowerCase().includes(query) ?? false) ||
                    g.notes.some(n => n.toLowerCase().includes(query)) ||
                    (getCategoryName(g.category)?.toLowerCase().includes(query) ?? false),
            );
        }

        // Sort
        const sorted = [...result].sort((a, b) => compareGroups(a, b, sortKey));
        if (sortDir === 'desc') sorted.reverse();
        return sorted;
    }, [groups, filterText, sortKey, sortDir]);

    const totalRecords = filteredAndSorted.reduce((sum, g) => sum + g.count, 0);

    return (
        <div className="min-h-screen p-8 bg-slate-50 text-slate-800">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Flight Reports
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        List the flights in the given time interval.
                    </p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() =>
                            fetch(
                                new Date(startDate + 'T00:00:00.000Z').toISOString(),
                                new Date(endDate + 'T23:59:59.999Z').toISOString(),
                            )
                        }
                        disabled={loading || !startDate || !endDate}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Loading...' : 'Fetch Data'}
                    </button>
                </div>

                {/* Filter input */}
                {records.length > 0 && (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                                placeholder="Filter by ICAO24, callsign, category or note..."
                                className="flex-1 text-sm border-none outline-none bg-transparent placeholder-slate-400"
                            />
                            {filterText && (
                                <button
                                    onClick={() => setFilterText('')}
                                    className="text-xs text-slate-400 hover:text-slate-600"
                                >
                                    Clear
                                </button>
                            )}
                            <span className="text-xs text-slate-400 tabular-nums shrink-0">
                                {filteredAndSorted.length} aircraft · {totalRecords} records
                            </span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left table-fixed">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                                <tr>
                                    <th className="px-2 py-4 w-[3%]"></th>
                                    {COLUMNS.map(col => (
                                        <th
                                            key={col.key}
                                            className="px-4 py-4 cursor-pointer select-none hover:bg-slate-100 transition-colors"
                                            style={{ width: col.width }}
                                            onClick={() => handleSort(col.key)}
                                        >
                                            <span className="inline-flex items-center">
                                                {col.label}
                                                <SortIcon dir={sortKey === col.key ? sortDir : null} />
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAndSorted.length === 0 && !loading ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-6 py-12 text-center text-slate-500"
                                        >
                                            There are no records in this time interval. Please try
                                            again.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSorted.map(group => {
                                        const isExpanded = expandedIcao24s.has(group.icao24);
                                        const canExpand = group.count > 1;
                                        return (
                                            <GroupRows
                                                key={group.icao24}
                                                group={group}
                                                isExpanded={isExpanded}
                                                canExpand={canExpand}
                                                onToggle={() => toggleExpand(group.icao24)}
                                            />
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GroupRows({
    group,
    isExpanded,
    canExpand,
    onToggle,
}: {
    group: AircraftGroup;
    isExpanded: boolean;
    canExpand: boolean;
    onToggle: () => void;
}) {
    return (
        <>
            {/* Summary row */}
            <tr
                className={`transition-colors ${canExpand ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-slate-50'} ${isExpanded ? 'bg-blue-50/50' : ''}`}
                onClick={canExpand ? onToggle : undefined}
            >
                <td className="px-2 py-4 text-center">
                    {canExpand && (
                        <span className="text-slate-400 text-xs select-none inline-block transition-transform duration-150"
                            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >
                            ▶
                        </span>
                    )}
                </td>
                <td className="px-4 py-4 font-medium text-slate-900 truncate">
                    {group.icao24}
                </td>
                <td className="px-4 py-4">
                    {group.category != null ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {getCategoryName(group.category)}
                        </span>
                    ) : (
                        '-'
                    )}
                </td>
                <td className="px-4 py-4 font-semibold text-blue-700 truncate">
                    {group.callsign ?? '-'}
                </td>

                <td className="px-4 py-4">
                    {group.count > 1 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {group.count} records
                        </span>
                    ) : (
                        <span className="text-slate-500 text-xs">1 record</span>
                    )}
                </td>

                <td className="px-4 py-4">
                    {group.avgAltitude != null ? (
                        <span className="text-slate-600 font-medium">
                            {Math.round(group.avgAltitude)} m
                        </span>
                    ) : (
                        '-'
                    )}
                </td>

                <td className="px-4 py-4">
                    {group.avgSpeed != null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {Math.round(group.avgSpeed)}
                        </span>
                    ) : (
                        '-'
                    )}
                </td>

                <td className="px-4 py-4 text-slate-500 text-xs">
                    {formatDate(group.firstSeen)}
                    {group.count > 1 && (
                        <>
                            <br />
                            <span className="text-slate-400">→ </span>
                            {formatDate(group.lastSeen)}
                        </>
                    )}
                </td>

                <td className="px-4 py-4 text-slate-500 truncate" title={group.notes.join(', ')}>
                    {group.notes.length > 0 ? group.notes.join(', ') : '-'}
                </td>
            </tr>

            {/* Expanded detail rows */}
            {isExpanded && group.records.map(r => (
                <tr
                    key={r.id}
                    className="bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                >
                    <td className="px-2 py-2.5"></td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs pl-8">
                        ↳
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                        {r.category != null ? getCategoryName(r.category) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                        {r.callsign ?? '-'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400 tabular-nums">
                        {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 tabular-nums">
                        {r.altitude != null ? `${Math.round(r.altitude)} m` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 tabular-nums">
                        {r.velocity != null ? Math.round(r.velocity) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">
                        {formatDate(r.recordedAt)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400 truncate" title={r.note ?? ''}>
                        {r.note ?? '-'}
                    </td>
                </tr>
            ))}
        </>
    );
}
