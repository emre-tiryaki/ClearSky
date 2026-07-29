import type { FlightPosition } from "../../../../shared/index.js";
import { isWithinBoundingBox, type BoundingBox } from "./BoundingBox.js";

// Async generator that yields only the flight positions within the given bounding box.
export async function* filterByBoundingBox(
    source: AsyncIterableIterator<FlightPosition>,
    box: BoundingBox,
): AsyncGenerator<FlightPosition> {
    for await (const position of source) {
        if (isWithinBoundingBox(position, box)) {
            yield position;
        }
    }
}