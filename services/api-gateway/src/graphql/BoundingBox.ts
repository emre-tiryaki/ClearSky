import type { FlightPosition } from "../../../../shared/index.js";

export interface BoundingBox {
    lamin: number;
    lomin: number;
    lamax: number;
    lomax: number;
}

export function isWithinBoundingBox(position: FlightPosition, box: BoundingBox): boolean {
    return (
        position.latitude >= box.lamin &&
        position.latitude <= box.lamax &&
        position.longitude >= box.lomin &&
        position.longitude <= box.lomax
    );
}
