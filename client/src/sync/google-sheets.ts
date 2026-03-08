import { LogEntry, Metric } from "../types";
import { SyncBackend } from "./interface";
import { requestAuth, getAccessToken, clearAuth } from "./google-auth";

const SPREADSHEET_NAME = "Balance Data";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";

const LOG_COLUMNS = ["timestamp", "metricId", "metricName", "value"];
const METRIC_COLUMNS = [
  "id",
  "name",
  "leftLabel",
  "rightLabel",
  "steps",
  "order",
  "enabled",
  "schedule",
];

async function sheetsRequest(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Token expired — try re-auth once
    const newToken = await requestAuth();
    const retry = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    if (!retry.ok) throw new Error(`Sheets API error: ${retry.status}`);
    return retry;
  }

  if (!res.ok) throw new Error(`Sheets API error: ${res.status}`);
  return res;
}

async function findSpreadsheet(): Promise<string | null> {
  const query = encodeURIComponent(
    `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
  );
  const res = await sheetsRequest(
    `${DRIVE_API}?q=${query}&fields=files(id)`,
  );
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

async function createSpreadsheet(): Promise<string> {
  const res = await sheetsRequest(SHEETS_API, {
    method: "POST",
    body: JSON.stringify({
      properties: { title: SPREADSHEET_NAME },
      sheets: [
        {
          properties: { title: "Logs", index: 0 },
          data: [
            {
              rowData: [
                {
                  values: LOG_COLUMNS.map((c) => ({
                    userEnteredValue: { stringValue: c },
                  })),
                },
              ],
            },
          ],
        },
        {
          properties: { title: "Metrics", index: 1 },
          data: [
            {
              rowData: [
                {
                  values: METRIC_COLUMNS.map((c) => ({
                    userEnteredValue: { stringValue: c },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });
  const data = await res.json();
  return data.spreadsheetId;
}

export class GoogleSheetsBackend implements SyncBackend {
  private spreadsheetId: string | null = null;
  private connected = false;
  private metricsNameMap = new Map<string, string>();

  isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    await requestAuth();

    this.spreadsheetId = await findSpreadsheet();
    if (!this.spreadsheetId) {
      this.spreadsheetId = await createSpreadsheet();
    }

    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.spreadsheetId = null;
    this.metricsNameMap.clear();
    clearAuth();
  }

  setMetricsNameMap(metrics: Metric[]): void {
    this.metricsNameMap.clear();
    for (const m of metrics) {
      this.metricsNameMap.set(m.id, m.name);
    }
  }

  async pushEntries(entries: LogEntry[]): Promise<void> {
    if (!this.spreadsheetId || entries.length === 0) return;

    const rows = entries.map((e) => [
      e.timestamp,
      e.metricId,
      this.metricsNameMap.get(e.metricId) ?? "",
      e.value,
    ]);

    await sheetsRequest(
      `${SHEETS_API}/${this.spreadsheetId}/values/Logs!A:D:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({ values: rows }),
      },
    );
  }

  async pullEntries(since: number): Promise<LogEntry[]> {
    if (!this.spreadsheetId) return [];

    const res = await sheetsRequest(
      `${SHEETS_API}/${this.spreadsheetId}/values/Logs!A2:D?majorDimension=ROWS`,
    );
    const data = await res.json();
    const rows: unknown[][] = data.values ?? [];

    return rows
      .filter((row) => Number(row[0]) > since)
      .map((row) => ({
        id: `sync-${row[0]}-${row[1]}`,
        timestamp: Number(row[0]),
        metricId: String(row[1]),
        value: Number(row[3]),
        synced: true,
      }));
  }

  async pushMetrics(metrics: Metric[]): Promise<void> {
    if (!this.spreadsheetId) return;

    this.setMetricsNameMap(metrics);

    const rows = [
      METRIC_COLUMNS,
      ...metrics.map((m) => [
        m.id,
        m.name,
        m.leftLabel,
        m.rightLabel,
        m.steps,
        m.order,
        m.enabled,
        (m.schedule ?? []).join(","),
      ]),
    ];

    await sheetsRequest(
      `${SHEETS_API}/${this.spreadsheetId}/values/Metrics!A1:H?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values: rows }),
      },
    );
  }

  async pullMetrics(since: number): Promise<Metric[]> {
    void since; // Metrics sheet is always read in full
    if (!this.spreadsheetId) return [];

    const res = await sheetsRequest(
      `${SHEETS_API}/${this.spreadsheetId}/values/Metrics!A2:H?majorDimension=ROWS`,
    );
    const data = await res.json();
    const rows: unknown[][] = data.values ?? [];

    return rows
      .filter((row) => row[0])
      .map((row) => ({
        id: String(row[0]),
        name: String(row[1]),
        leftLabel: String(row[2]),
        rightLabel: String(row[3]),
        steps: Number(row[4]) || 5,
        order: Number(row[5]) || 0,
        enabled: row[6] === true || row[6] === "true",
        schedule: row[7] ? String(row[7]).split(",").filter(Boolean) : undefined,
      }));
  }
}
