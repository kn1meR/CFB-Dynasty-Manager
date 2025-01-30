import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24,
  className,
  fullPage = false
}) => {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <Loader2 
          className={cn("animate-spin text-primary", className)} 
          size={size}
        />
      </div>
    );
  }

  return (
    <Loader2 
      className={cn("animate-spin", className)} 
      size={size}
    />
  );
};

interface LoadingStateProps {
  children: React.ReactNode;
  loading: boolean;
  loadingText?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  children,
  loading,
  loadingText = "Loading..."
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center space-x-2 min-h-[400px]">
        <LoadingSpinner />
        <span>{loadingText}</span>
      </div>
    );
  }
  return <>{children}</>;
};