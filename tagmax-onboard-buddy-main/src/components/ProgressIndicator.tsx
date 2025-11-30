import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentPhase: number;
  totalPhases: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentPhase, 
  totalPhases, 
  className 
}) => {
  return (
    <div className={cn("flex justify-center items-center space-x-2 mb-6", className)}>
      {Array.from({ length: totalPhases }, (_, index) => (
        <div
          key={index}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            index < currentPhase
              ? "bg-success"
              : index === currentPhase
              ? "bg-primary"
              : "bg-muted"
          )}
        />
      ))}
    </div>
  );
};