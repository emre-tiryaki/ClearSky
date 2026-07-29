import type { BoundingBox, FlightPosition } from "../../../../shared/index.js";

// Returns true if the flight's coordinates fall inside the given bounding box.
export function isWithinBoundingBox(position: FlightPosition, box: BoundingBox): boolean {
    return (
        position.latitude >= box.lamin &&
        position.latitude <= box.lamax &&
        position.longitude >= box.lomin &&
        position.longitude <= box.lomax
    );
}
