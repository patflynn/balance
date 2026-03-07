export interface Metric {
  id: string;
  name: string;
  leftLabel: string;
  rightLabel: string;
  steps: number;
}

export interface LogEntry {
  id: string;
  metricId: string;
  value: number;
  timestamp: number;
}

export interface FoodLogEntry {
  id: string;
  timestamp: number;
  imageUrl: string;
  calories: number;
  dairy: boolean;
  carb: string;
  gluten: boolean;
  meat: string;
}
