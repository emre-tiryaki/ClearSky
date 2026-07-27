import { OpenSkyAuthError, type OpenSkyTokenManager } from './OpenSkyTokenManager.js';
import type { FetchStatesOptions, OpenSkyStatesResponse, OpenSkyStateVectorRaw, RawStateVector } from './types.ts';

// Neccesary indexes from the raw state vector.
const STATE_VECTOR_INDEX = {
  ICAO24: 0,
  CALLSIGN: 1,
  LONGITUDE: 5,
  LATITUDE: 6,
  BARO_ALTITUDE: 7,
  ON_GROUND: 8,
  VELOCITY: 9,
  TRUE_TRACK: 10,
  VERTICAL_RATE: 11,
  CATEGORY: 17,
} as const;

export class OpenSkyRateLimitError extends Error {
  // Thrown when the OpenSky API asks the client to slow down and retry later.
  constructor(public readonly retryAfterSeconds: number) {
    super(`OpenSky rate limit exceeded, retry after ${retryAfterSeconds}s`);
    this.name = 'OpenSkyRateLimitError';
  }
}

// Client wrapper for the OpenSky REST API.
// It fetches raw state vectors and maps them into the local device-interface shape.
export class OpenSkyClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenManager: OpenSkyTokenManager,
  ) { }

  // Fetches aircraft state vectors from OpenSky and returns  them in the local raw shape.
  async fetchStates(options: FetchStatesOptions = {}): Promise<RawStateVector[]> {
    const url = new URL(`${this.baseUrl}/states/all`);
    url.searchParams.set('extended', '1');

    options.icao24?.forEach((code) => url.searchParams.append('icao24', code));
    if (options.time !== undefined) {
      url.searchParams.set('time', String(options.time));
    }

    const token = await this.tokenManager.getToken();
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.status === 401) {
      this.tokenManager.invalidate();
      throw new OpenSkyAuthError(response.status);
    }

    if (response.status === 429) {
      this.handleRateLimit(response);
    }

    if (!response.ok) {
      throw new Error(`OpenSky request failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as OpenSkyStatesResponse;
    return (payload.states ?? []).map((vector) => this.mapVector(vector));
  }

  // Converts the tuple-based OpenSky payload into a named object for easier consumption.
  private mapVector(vector: OpenSkyStateVectorRaw): RawStateVector {
    return {
      icao24: vector[STATE_VECTOR_INDEX.ICAO24] as string,
      callsign: (vector[STATE_VECTOR_INDEX.CALLSIGN] as string | null)?.trim() || null,
      longitude: vector[STATE_VECTOR_INDEX.LONGITUDE] as number | null,
      latitude: vector[STATE_VECTOR_INDEX.LATITUDE] as number | null,
      baro_altitude: vector[STATE_VECTOR_INDEX.BARO_ALTITUDE] as number | null,
      on_ground: vector[STATE_VECTOR_INDEX.ON_GROUND] as boolean,
      velocity: vector[STATE_VECTOR_INDEX.VELOCITY] as number | null,
      true_track: vector[STATE_VECTOR_INDEX.TRUE_TRACK] as number | null,
      vertical_rate: vector[STATE_VECTOR_INDEX.VERTICAL_RATE] as number | null,
      category: vector[STATE_VECTOR_INDEX.CATEGORY] as number || 0,
    };
  }

  // Converts OpenSky rate-limit responses into a typed error with retry timing.
  private handleRateLimit(response: Response): never {
    const retryAfter = Number(response.headers.get('X-Rate-Limit-Retry-After-Seconds') ?? 60);
    throw new OpenSkyRateLimitError(retryAfter);
  }
}