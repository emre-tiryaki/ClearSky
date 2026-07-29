import type { FlightPosition as FlightPositionModel, BoundingBox as SharedBoundingBox, Wire } from "../../../shared/index.js";

export type FlightPosition = Wire<FlightPositionModel>;
export type BoundingBox = SharedBoundingBox;