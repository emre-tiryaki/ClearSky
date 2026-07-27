import * as L from "leaflet";

const ROUND_STEP = 5;
const iconCache = new Map<string, L.DivIcon>();

function getCategoryPath(category: number): string {
    switch(category) {
        case 8: // Helicopter
            return "M12 4v2a2 2 0 0 1-2 2H6L4 9v2l6 1.5V17l-3 2v1.5l4-1 4 1V19l-3-2v-4.5L18 11V9l-2-1H12V4a2 2 0 0 0-2-2z M10 1h4v2h-4z";
        case 4: case 5: case 6: // Big/Heavy aircrafts
            return "M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z";
        
        case 14:    // Drones
            return "M12 2a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2M7 11v2h10v-2H7m-3 4v2h16v-2H4m3-4H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-8m10 0h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v-8M7 9h2a2 2 0 0 0 2-2V5H9v2H7v2m6 0h2V7h-2V5h-2v2a2 2 0 0 0 2 2z";
        
        default:    // Simple aircrafts
            return "M12 2L15 9L22 12L15 13L14 20L12 17L10 20L9 13L2 12L9 9L12 2Z"
    }
}

function getCategoryColor(category: number, onGround: boolean): string {
    if (onGround) return "#9ca3af"; // Gri
    switch (category) {
        case 8: 
            return "#14b8a6"; // Turqoise (Helicopter)
        case 4: case 5: case 6: 
            return "#f97316"; // Orange (Big Planes)
        case 14: return "#eab308"; // Yellow (Drone)
        case 2: case 3: 
            return "#2563eb"; // Blue (Small Planes)
        default: 
            return "#64748b"; // Blue-Gray for others
    }
}

function planeSvg(rotation: number, color: string, path: string): string {
    return `
        <svg viewBox="0 0 24 24" style="transform: rotate(${rotation}deg); width: 100%; height: 100%;">
        <path d="${path}" fill="${color}" stroke="#1e3a8a" stroke-width="0.5" />
      </svg>
    `;
}

export function getPlaneIcon(heading: number | null, onGround: boolean, category: number, altitude: number | null): L.DivIcon {
    const rounded = Math.round((heading ?? 0) / ROUND_STEP) * ROUND_STEP;
    
    const alt = Math.max(0, altitude || 0);
    const size = Math.round(20 + Math.min(1, alt / 10000) * 8);

    const key = `${rounded}-${onGround}-${category}-${size}`;

    const cached = iconCache.get(key);
    if(cached) return cached;

    const color = getCategoryColor(category, onGround);
    const path = getCategoryPath(category);
    const iconAnchor = Math.round(size/2);

    const icon = L.divIcon({
        className: "flight-marker",
        html: planeSvg(rounded, color, path),
        iconSize: [size, size],
        iconAnchor: [iconAnchor, iconAnchor],
    });

    iconCache.set(key, icon);
    return icon;
}