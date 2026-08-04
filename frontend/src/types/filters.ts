export type FlightStatusFilter = "all" | "airborne" | "ground";
export type VerticalRateFilter = "all" | "climbing" | "descending" | "level";

export interface FlightFilters {
    searchQuery: string;
    selectedCategories: Set<number> | null;
    altitudeMin: number | null;
    altitudeMax: number | null;
    speedMin: number | null;
    speedMax: number | null;
    status: FlightStatusFilter;
    verticalRate: VerticalRateFilter;
}

export const DEFAULT_FILTERS: FlightFilters = {
    searchQuery: "",
    selectedCategories: null,
    altitudeMax: null,
    altitudeMin: null,
    speedMax: null,
    speedMin: null,
    status: "all",
    verticalRate: "all"
}