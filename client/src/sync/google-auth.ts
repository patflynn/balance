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

const SCOPES =
  "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";
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

let authPromise: Promise<string> | null = null;

export function requestAuth(): Promise<string> {
  if (!isGisLoaded()) {
    return Promise.reject(new Error("Google Identity Services not loaded"));
  }

  if (!CLIENT_ID) {
    return Promise.reject(new Error("VITE_GOOGLE_CLIENT_ID is not configured"));
  }

  const valid = getAccessToken();
  if (valid) {
    return Promise.resolve(valid);
  }

  if (authPromise) {
    return authPromise;
  }

  authPromise = new Promise((resolve, reject) => {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: TokenResponse) => {
        authPromise = null;
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        accessToken = response.access_token;
        tokenExpiry = Date.now() + response.expires_in * 1000 - 60_000;
        resolve(response.access_token);
      },
      error_callback: (error) => {
        authPromise = null;
        reject(new Error(error.message));
      },
    });

    tokenClient.requestAccessToken();
  });

  return authPromise;
}

export function clearAuth(): void {
  accessToken = null;
  tokenExpiry = 0;
  tokenClient = null;
}
