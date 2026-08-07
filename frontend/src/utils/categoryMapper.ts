// Maps an OpenSky aircraft category code to a human-readable label.
export function getCategoryName(category: number | null | undefined): string {
    if (category == null) return "Bilinmiyor";

    switch (category) {
        case 1: return "No info (ADS-B)";
        case 2: return "Light Aircraft (< 15.500 lb)";
        case 3: return "Little Aircraft (15.500 - 75.000 lb)";
        case 4: return "Big Aircraft (75.000 - 300.000 lb)";
        case 5: return "Big Aircraft (Powerful Swirl / B-757)";
        case 6: return "Heavy Aircraft (> 300.000 lb)";
        case 7: return "High Performance";
        case 8: return "Helicopter";
        case 9: return "Glider";
        case 10: return "Lighter-than-Air Vehicle (Balloon/Airship)";
        case 11: return "Parachutist";
        case 12: return "Ultralight / ParaGliding";
        case 14: return "Unmanned Aerial Vehicle (UAV/Drone)";
        case 15: return "Spacecraft";
        case 16: return "Emergency Location Vehicle";
        case 17: return "Service Location Vehicle";
        case 0:
        default:
            return "Unknown";
    }
}