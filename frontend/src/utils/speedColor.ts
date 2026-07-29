const SLOW_COLOR: [number, number, number] = [37, 99, 235];
const FAST_COLOR: [number, number, number] = [220, 38, 38];

// Linearly interpolates between blue (slow) and red (fast) based on the
// normalized speed value `t`.
export function speedToColor(t: number): string {
    const clamped = Math.min(1, Math.max(0, t));
    const r = Math.round(SLOW_COLOR[0] + (FAST_COLOR[0] - SLOW_COLOR[0]) * clamped);
    const g = Math.round(SLOW_COLOR[1] + (FAST_COLOR[1] - SLOW_COLOR[1]) * clamped);
    const b = Math.round(SLOW_COLOR[2] + (FAST_COLOR[2] - SLOW_COLOR[2]) * clamped);
    
    return `rgb(${r}, ${g}, ${b})`;
}