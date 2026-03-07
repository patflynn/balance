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
    <div className="bg-mint rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-white relative overflow-hidden">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative z-[1] flex flex-col items-center justify-center gap-3 text-center">
        <div
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-white/30"
          onClick={() => fileInputRef.current?.click()}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-sm tracking-[0.1em] uppercase font-medium">
            Log Meal
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Take a photo to auto-track
          </p>
        </div>
      </div>

      <svg
        className="absolute bottom-0 left-0 w-full h-[85%] opacity-20 pointer-events-none"
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
