import type { FlightPosition } from "../../../shared";
import type { FlightFilters } from "../types/filters";

const LEVEL_VERTICAL_RATE_THRESHOLD = 1;

function matchesSearch(flight: FlightPosition, query: string): boolean {
    if (!query) return true;

    const normalized = query.trim().toLowerCase();
    const icaoMatch = flight.icao24.toLowerCase().includes(normalized);
    const callsignMatch = flight.callsign?.toLowerCase().includes(normalized) ?? false;

    return icaoMatch || callsignMatch;
}

function matchesCategory(flight: FlightPosition, selected: Set<number> | null): boolean {
    if (selected === null) return true;

    return selected.has(flight.category);
}

function matchesRange(value: number | null, min: number | null, max: number | null): boolean {
    if (value === null) return min === null && max === null;
    if ((min !== null && value < min) || (max !== null && value > max)) return false;
    return true;
}

function matchesStatus(flight: FlightPosition, status: FlightFilters["status"]): boolean {
    if (status === "all") return true;
    if (status === "ground") return flight.onGround;
    return !flight.onGround;
}

function matchesVerticalRate(flight: FlightPosition, filter: FlightFilters["verticalRate"]): boolean {
    if (filter === "all") return true;

    const rate = flight.verticalRate;
    if (rate === null) return false;

    if (filter === "level") return Math.abs(rate) < LEVEL_VERTICAL_RATE_THRESHOLD;
    if (filter === "climbing") return rate > LEVEL_VERTICAL_RATE_THRESHOLD;
    return rate <= -LEVEL_VERTICAL_RATE_THRESHOLD;
}

export function matchesFilters(flight: FlightPosition, filters: FlightFilters): boolean {
    return (
        matchesSearch(flight, filters.searchQuery) &&
        matchesCategory(flight, filters.selectedCategories) &&
        matchesRange(flight.altitude, filters.altitudeMin, filters.altitudeMax) &&
        matchesRange(flight.speed, filters.speedMin, filters.speedMax) &&
        matchesStatus(flight, filters.status) &&
        matchesVerticalRate(flight, filters.verticalRate)
    );
}

export function filterFlights(flights: FlightPosition[], filters: FlightFilters): FlightPosition[] {
    return flights.filter(flight => matchesFilters(flight, filters));
}