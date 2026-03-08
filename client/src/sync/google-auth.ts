declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string; message: string }) => void;
          }): TokenClient;
        };
      };
    };
  }
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface TokenClient {
  requestAccessToken(): void;
}

const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

let accessToken: string | null = null;
let tokenExpiry = 0;
let tokenClient: TokenClient | null = null;

export function isGisLoaded(): boolean {
  return !!window.google?.accounts?.oauth2;
}

export function getAccessToken(): string | null {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  accessToken = null;
  return null;
}

export function requestAuth(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isGisLoaded()) {
      reject(new Error("Google Identity Services not loaded"));
      return;
    }

    if (!CLIENT_ID) {
      reject(new Error("VITE_GOOGLE_CLIENT_ID is not configured"));
      return;
    }

    const valid = getAccessToken();
    if (valid) {
      resolve(valid);
      return;
    }

    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: TokenResponse) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        accessToken = response.access_token;
        tokenExpiry = Date.now() + response.expires_in * 1000 - 60_000;
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(new Error(error.message));
      },
    });

    tokenClient.requestAccessToken();
  });
}

export function clearAuth(): void {
  accessToken = null;
  tokenExpiry = 0;
  tokenClient = null;
}
