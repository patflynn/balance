import { LogEntry, Metric } from "../types";

export interface SyncBackend {
  connect(): Promise<void>;
  pushEntries(entries: LogEntry[]): Promise<void>;
  pullEntries(since: number): Promise<LogEntry[]>;
  pushMetrics(metrics: Metric[]): Promise<void>;
  pullMetrics(since: number): Promise<Metric[]>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  setMetricsNameMap?(metrics: Metric[]): void;
}
