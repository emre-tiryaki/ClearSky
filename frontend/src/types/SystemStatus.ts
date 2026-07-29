import type { SystemStatus as SystemStatusModel, Wire } from "../../../shared/index.d.ts";

// Wire-serialized system status used on the client side (Dates become strings).
export type SystemStatus = Wire<SystemStatusModel>;