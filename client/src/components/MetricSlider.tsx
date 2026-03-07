import { Metric } from "../types";

interface Props {
  metric: Metric;
  currentValue?: number;
  onLog: (val: number) => void;
}

export function MetricSlider({ metric, currentValue, onLog }: Props) {
  return (
    <div className="bg-cream rounded-[2rem] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <h2 className="text-[11px] tracking-[0.15em] uppercase text-forest font-medium">
          {metric.name}
        </h2>
        {currentValue !== undefined && (
          <span className="text-[10px] text-mint font-medium">Recorded</span>
        )}
      </div>

      <div className="flex justify-between items-center h-12 bg-sand rounded-full px-1 relative">
        {Array.from({ length: metric.steps }).map((_, i) => (
          <div
            key={i}
            className="relative w-10 h-10 flex justify-center items-center cursor-pointer z-[1]"
            onClick={() => onLog(i)}
          >
            {currentValue === i ? (
              <div className="absolute inset-0 bg-mint rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-mint opacity-30" />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between px-2 text-[9px] uppercase tracking-[0.05em] text-mint font-medium">
        <span>{metric.leftLabel}</span>
        <span>{metric.rightLabel}</span>
      </div>
    </div>
  );
}
