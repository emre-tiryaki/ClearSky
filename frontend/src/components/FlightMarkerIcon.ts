import * as L from "leaflet";

const ROUND_STEP = 5;
const iconCache = new Map<string, L.DivIcon>();

function planeSvg(rotation: number, color: string): string {
    return `
        <svg width="22" height="22" viewBox="0 0 24 24" style="transform: rotate(${rotation}deg);">
        <path d="M12 2L15 9L22 12L15 13L14 20L12 17L10 20L9 13L2 12L9 9L12 2Z"
          fill="${color}" stroke="#1e3a8a" stroke-width="0.5" />
      </svg>
    `;
}

export function getPlaneIcon(heading: number | null, onGround: boolean): L.DivIcon {
    const rounded = Math.round((heading ?? 0) / ROUND_STEP) * ROUND_STEP;
    const key = `${rounded}-${onGround}`;

    const cached = iconCache.get(key);
    if (cached) return cached;

    const color = onGround ? "#9ca3af" : "#2563eb";
    const icon = L.divIcon({
        className: "flight-marker",
        html: planeSvg(rounded, color),
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });

    iconCache.set(key, icon);
    return icon;
}