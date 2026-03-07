import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { FoodLogEntry } from "../types";

export function FoodLogger({
  onLog,
}: {
  onLog: (data: Omit<FoodLogEntry, "id" | "timestamp">) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Placeholder: in a real app this would call an AI API to analyze the image
      onLog({
        imageUrl: base64,
        calories: Math.round(200 + Math.random() * 600),
        dairy: Math.random() > 0.5,
        carb: ["none", "low", "med", "heavy"][Math.floor(Math.random() * 4)],
        gluten: Math.random() > 0.5,
        meat: ["none", "white", "red", "fish"][Math.floor(Math.random() * 4)],
      });
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="food-logger">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="food-logger-content">
        <div
          className="food-logger-button"
          onClick={() => fileInputRef.current?.click()}
        >
          {isProcessing ? (
            <Loader2 className="food-logger-icon spinning" />
          ) : (
            <Camera className="food-logger-icon" />
          )}
        </div>
        <div>
          <h2 className="food-logger-title">Log Meal</h2>
          <p className="food-logger-subtitle">Take a photo to auto-track</p>
        </div>
      </div>

      <svg
        className="food-logger-wave"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d="M0,40 Q30,10 60,40 T100,20 L100,100 L0,100 Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
}
