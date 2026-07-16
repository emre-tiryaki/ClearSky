import type { FlightPosition } from "../../../../shared/index.js";
import { isWithinBoundingBox, type BoundingBox } from "./BoundingBox.js";

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