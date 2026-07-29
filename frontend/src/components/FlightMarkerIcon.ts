import * as L from "leaflet";

const ROUND_STEP = 5;
const iconCache = new Map<string, L.DivIcon>();

// Returns an SVG path string matching the aircraft category (helicopter, heavy, drone, etc.).
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

// Computes a dynamic HSL color based on altitude and speed.
// Grounded aircraft are grey; airborne ones shift from red (low) to blue (high altitude).
function getDynamicColor(onGround: boolean, altitude: number | null, speed: number | null): string {
    if (onGround) return "#9ca3af"; // Gri

    const alt = Math.max(0, altitude || 0);
    const spd = Math.max(0, speed || 0);
    const altRatio = Math.min(1, alt / 12000);
    const speedRatio = Math.min(1, spd / 300);
    const hue = Math.round(altRatio * 240);
    
    const lightness = Math.round(30 + speedRatio * 40);

    return `hsl(${hue}, 100%, ${lightness}%)`;
}

function planeSvg(rotation: number, color: string, path: string): string {
    return `
        <svg viewBox="0 0 24 24" style="transform: rotate(${rotation}deg); width: 100%; height: 100%;">
        <path d="${path}" fill="${color}" stroke="#1e3a8a" stroke-width="0.5" />
      </svg>
    `;
}

// Builds and caches a Leaflet DivIcon with a rotated, color-coded plane SVG.
// Values are rounded to reduce cache entries and avoid excessive DOM re-creation.
export function getPlaneIcon(heading: number | null, onGround: boolean, category: number, altitude: number | null, speed: number | null): L.DivIcon {
    const roundedHeading = Math.round((heading ?? 0) / ROUND_STEP) * ROUND_STEP;
    const roundedAlt = Math.round((altitude || 0) / 500) * 500;
    const roundedSpeed = Math.round((speed || 0) / 20) * 20;
    
    const size = Math.round(20 + Math.min(1, Math.max(0, altitude || 0) / 10000) * 8); 
    const key = `${roundedHeading}-${onGround}-${category}-${roundedAlt}-${roundedSpeed}-${size}`;
    const cached = iconCache.get(key);
    if (cached) return cached;
    const color = getDynamicColor(onGround, altitude, speed);
    const path = getCategoryPath(category);
    const iconAnchor = Math.round(size / 2);
    const icon = L.divIcon({
        className: "flight-marker",
        html: planeSvg(roundedHeading, color, path),
        iconSize: [size, size],
        iconAnchor: [iconAnchor, iconAnchor],
    });
    iconCache.set(key, icon);
    return icon;
}