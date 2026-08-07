import { useMemo, useState } from "react";
import {
    DEFAULT_FILTERS,
    type FlightFilters,
    type FlightStatusFilter,
    type VerticalRateFilter,
} from "../types/filters";
import type { FlightPosition } from "../types/flight";
import {
    buildCategoryOptions,
    TYPE_CATEGORY_CODES,
    WEIGHT_CATEGORY_CODES,
} from "../utils/categoryGroups";
import type { Bookmark } from "../types/Bookmark";

interface SearchFilterPanelProps {
    flights: FlightPosition[];
    filters: FlightFilters;
    onFiltersChange: (filters: FlightFilters) => void;
    onSelectFlight: (icao24: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    bookmarks: Bookmark[];
    onRemoveBookmark: (icao24: string) => void;
}

const MAX_SUGGESTIONS = 8;
const STATUS_LABELS: Record<FlightStatusFilter, string> = {
    all: "All",
    airborne: "Airborne",
    ground: "On Ground",
};
const VERTICAL_RATE_LABELS: Record<VerticalRateFilter, string> = {
    all: "All",
    climbing: "Climbing",
    level: "Level",
    descending: "Descending",
};

// Small inline plane SVG used next to bookmark entries.
function PlaneIcon({ size = 14 }: { size?: number }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            style={{ display: "inline-block", verticalAlign: "middle" }}
        >
            <path
                d="M12 2L15 9L22 12L15 13L14 20L12 17L10 20L9 13L2 12L9 9L12 2Z"
                fill="#374151"
            />
        </svg>
    );
}

export function SearchFilterPanel({
    filters,
    flights,
    isOpen,
    onFiltersChange,
    onSelectFlight,
    onToggle,
    bookmarks,
    onRemoveBookmark,
}: SearchFilterPanelProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);

    const availableCategories = useMemo(() => {
        const present = new Set(flights.map((f) => f.category));
        return {
            weight: buildCategoryOptions(
                WEIGHT_CATEGORY_CODES.filter((c) => present.has(c)),
            ),
            type: buildCategoryOptions(
                TYPE_CATEGORY_CODES.filter((c) => present.has(c)),
            ),
        };
    }, [flights]);

    const suggestions = useMemo(() => {
        const query = filters.searchQuery.trim().toLowerCase();
        if (!query) return [];

        return flights
            .filter(
                (f) =>
                    f.icao24.toLowerCase().includes(query) ||
                    (f.callsign?.toLowerCase().includes(query) ?? false),
            )
            .slice(0, MAX_SUGGESTIONS);
    }, [flights, filters.searchQuery]);
    const update = (partial: Partial<FlightFilters>) => {
        onFiltersChange({ ...filters, ...partial });
    };

    const toggleCategory = (code: number) => {
        const current = filters.selectedCategories ?? new Set<number>();
        const next = new Set(current);
        if (next.has(code)) next.delete(code);
        else next.add(code);
        update({ selectedCategories: next.size === 0 ? null : next });
    };

    const handleSelectSuggestion = (icao24: string) => {
        onSelectFlight(icao24);
        setShowSuggestions(false);
        update({ searchQuery: "" });
    };

    const handleSelectBookmark = (icao24: string) => {
        onSelectFlight(icao24);
    };

    const activeFilterCount =
        (filters.selectedCategories?.size ?? 0) +
        (filters.altitudeMin !== null || filters.altitudeMax !== null ? 1 : 0) +
        (filters.speedMin !== null || filters.speedMax !== null ? 1 : 0) +
        (filters.status !== "all" ? 1 : 0) +
        (filters.verticalRate !== "all" ? 1 : 0);

    return (
        <>
            <button
                onClick={onToggle}
                className="absolute right-4 top-4 z-1000 bg-white rounded-lg shadow-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
                Search & Filter
                {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl z-1000 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border border-slate-200">
                        <h2 className="font-semibold text-slate-800">
                            Search & Filter
                        </h2>
                        <button
                            onClick={onToggle}
                            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                        <div className="relative">
                            <label className="text-sm font-medium text-slate-600">
                                ICAO24 / Callsign
                            </label>
                            <input
                                type="text"
                                value={filters.searchQuery}
                                onChange={(e) => {
                                    update({ searchQuery: e.target.value });
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="4b1806 or THY1TR"
                                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-blue-500"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-56 overflow-y-auto z-10">
                                    {suggestions.map((flight) => (
                                        <li key={flight.icao24}>
                                            <button
                                                onClick={() =>
                                                    handleSelectSuggestion(
                                                        flight.icao24,
                                                    )
                                                }
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                                            >
                                                <span className="font-medium text-slate-800">
                                                    {flight.callsign?.trim() ||
                                                        flight.icao24}
                                                </span>
                                                <span className="text-slate-400 ml-2 text-xs">
                                                    {flight.icao24}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600">
                                Bookmarks
                                {bookmarks.length > 0 && (
                                    <span className="ml-2 text-xs text-slate-400">
                                        {bookmarks.length}
                                    </span>
                                )}
                            </label>
                            {bookmarks.length === 0 ? (
                                <p className="mt-1 text-xs text-slate-400">
                                    No Bookmarked Aircraft
                                </p>
                            ) : (
                                <ul className="mt-1 space-y-1">
                                    {bookmarks.map((b) => (
                                        <li
                                            key={b.icao24}
                                            className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5"
                                        >
                                            <button
                                                onClick={() =>
                                                    handleSelectBookmark(
                                                        b.icao24,
                                                    )
                                                }
                                                className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 text-left"
                                            >
                                                <PlaneIcon size={14} />
                                                <span className="font-medium">
                                                    {b.callsign?.trim() ||
                                                        b.icao24}
                                                </span>
                                                <span className="text-slate-400 text-xs">
                                                    {b.icao24}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onRemoveBookmark(b.icao24)
                                                }
                                                className="text-slate-400 hover:text-red-500 text-xs px-1"
                                                title="Remove Bookmark"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600">
                                Status
                            </label>
                            <div className="mt-1 flex gap-2">
                                {(
                                    Object.keys(
                                        STATUS_LABELS,
                                    ) as FlightStatusFilter[]
                                ).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => update({ status })}
                                        className={`px-3 py-1.5 text-xs font-medium rounded border ${
                                            filters.status === status
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        {STATUS_LABELS[status]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600">
                                Vertical Rate
                            </label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {(
                                    Object.keys(
                                        VERTICAL_RATE_LABELS,
                                    ) as VerticalRateFilter[]
                                ).map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() =>
                                            update({ verticalRate: rate })
                                        }
                                        className={`px-3 py-1.5 text-xs font-medium rounded border ${
                                            filters.verticalRate === rate
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        {VERTICAL_RATE_LABELS[rate]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600">
                                Altitude (m)
                            </label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="number"
                                    value={filters.altitudeMin ?? ""}
                                    onChange={(e) =>
                                        update({
                                            altitudeMin:
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                    placeholder="Min"
                                    className="w-1/2 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    value={filters.altitudeMax ?? ""}
                                    onChange={(e) =>
                                        update({
                                            altitudeMax:
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                    placeholder="Max"
                                    className="w-1/2 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600">
                                Speed (km/h)
                            </label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="number"
                                    value={filters.speedMin ?? ""}
                                    onChange={(e) =>
                                        update({
                                            speedMin:
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                    placeholder="Min"
                                    className="w-1/2 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    value={filters.speedMax ?? ""}
                                    onChange={(e) =>
                                        update({
                                            speedMax:
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                    placeholder="Max"
                                    className="w-1/2 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {availableCategories.weight.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-slate-600">
                                    Weight Class
                                </label>
                                <div className="mt-1 space-y-1">
                                    {availableCategories.weight.map(
                                        (option) => (
                                            <label
                                                key={option.code}
                                                className="flex items-center gap-2 text-sm text-slate-700"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        filters.selectedCategories?.has(
                                                            option.code,
                                                        ) ?? false
                                                    }
                                                    onChange={() =>
                                                        toggleCategory(
                                                            option.code,
                                                        )
                                                    }
                                                    className="rounded border-slate-300"
                                                />
                                                {option.label}
                                            </label>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        {availableCategories.type.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-slate-600">
                                    Aircraft Type
                                </label>
                                <div className="mt-1 space-y-1">
                                    {availableCategories.type.map((option) => (
                                        <label
                                            key={option.code}
                                            className="flex items-center gap-2 text-sm text-slate-700"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filters.selectedCategories?.has(
                                                        option.code,
                                                    ) ?? false
                                                }
                                                onChange={() =>
                                                    toggleCategory(option.code)
                                                }
                                                className="rounded border-slate-300"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-200 px-4 py-3">
                        <button
                            onClick={() => onFiltersChange(DEFAULT_FILTERS)}
                            className="w-full rounded bg-slate-100 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
                        >
                            Reset the Filters
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
