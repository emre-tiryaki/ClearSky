// Shape of the OAuth2 token response from the OpenSky auth server.
interface TokenResponse {
    access_token: string;
    expires_in: number;
}

const TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const REFRESH_MARGIN_SECONDS = 30;

// Thrown when the OpenSky token request returns a non-OK HTTP status.
export class OpenSkyAuthError extends Error {
    constructor(status: number) {
        super(`OpenSky token request failed with status ${status}`);
        this.name = 'OpenSkyAuthError';
    }
}

// Manages the OAuth2 client-credentials token for OpenSky API access.
// Caches the token in memory and refreshes it automatically before expiry.
export class OpenSkyTokenManager {
    private token: string | null = null;
    private expiresAt: number | null = null;

    constructor(
        private readonly clientId: string,
        private readonly clientSecret: string,
    ) {}

    async getToken(): Promise<string> {
        if (this.token && this.expiresAt && Date.now() < this.expiresAt)
            return this.token;

        return this.refresh();
    }

    invalidate(): void {
        this.token = null;
        this.expiresAt = null;
    }
 
    private async refresh(): Promise<string> {
        const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret
        });

        const response = await fetch(TOKEN_URL, {
            method: "POST",
            body,
        });

        if (!response.ok) 
            throw new OpenSkyAuthError(response.status);

        const payload = (await response.json()) as TokenResponse;
        this.token = payload.access_token;
        this.expiresAt = Date.now() + (payload.expires_in - REFRESH_MARGIN_SECONDS) * 1000  ;

        return this.token;
    }
}