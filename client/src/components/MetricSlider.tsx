import { Metric } from "../types";

interface Props {
  metric: Metric;
  currentValue?: number;
  onLog: (val: number) => void;
}

export function MetricSlider({ metric, currentValue, onLog }: Props) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h2 className="metric-name">{metric.name}</h2>
        {currentValue !== undefined && (
          <span className="metric-recorded">Recorded</span>
        )}
      </div>

      <div className="metric-track">
        {Array.from({ length: metric.steps }).map((_, i) => (
          <div
            key={i}
            className="metric-step"
            onClick={() => onLog(i)}
          >
            {currentValue === i ? (
              <div className="metric-thumb" />
            ) : (
              <div className="metric-dot" />
            )}
          </div>
        ))}
      </div>

      <div className="metric-labels">
        <span>{metric.leftLabel}</span>
        <span>{metric.rightLabel}</span>
      </div>
    </div>
  );
}
