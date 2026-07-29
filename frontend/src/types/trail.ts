// A single coordinate sample used to render the trailing polyline behind an aircraft. 
export interface TrailPoint {
    lat: number;
    lon: number;
    speed: number | null;
    timestamp: string;   
}