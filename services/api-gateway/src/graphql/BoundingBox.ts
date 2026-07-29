import type { BoundingBox, FlightPosition } from "../../../../shared/index.js";

// This is for not breaking anywhere else in this service.
export type { BoundingBox }

export function isWithinBoundingBox(position: FlightPosition, box: BoundingBox): boolean {
    return (
        position.latitude >= box.lamin &&
        position.latitude <= box.lamax &&
        position.longitude >= box.lomin &&
        position.longitude <= box.lomax
    );
}
