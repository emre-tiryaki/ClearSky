import type { FlightPosition as FlightPositionModel, BoundingBox as SharedBoundingBox, Wire } from "../../../shared/index.js";

// Frontend-safe re-exports of shared models.
// Wire<T> converts Date fields to string since JSON doesn't preserve Date objects.
export type FlightPosition = Wire<FlightPositionModel>;
export type BoundingBox = SharedBoundingBox;