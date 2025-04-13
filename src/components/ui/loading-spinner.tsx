
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export function LoadingSpinner({ message = "Loading...", size = 24 }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className="h-[1.2em] w-[1.2em] animate-spin text-sprout-purple" style={{ width: size, height: size }} />
      <p className="text-sm text-sprout-purple/80">{message}</p>
    </div>
  );
}
