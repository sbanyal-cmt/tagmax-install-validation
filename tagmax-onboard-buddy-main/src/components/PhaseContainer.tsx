import React from 'react';
import { Card } from '@/components/ui/card';
import { ProgressIndicator } from './ProgressIndicator';
import { cn } from '@/lib/utils';

interface PhaseContainerProps {
  currentPhase: number;
  totalPhases: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const PhaseContainer: React.FC<PhaseContainerProps> = ({
  currentPhase,
  totalPhases,
  title,
  subtitle,
  children,
  className
}) => {
  return (
    <div className={cn("min-h-screen bg-background p-4 flex flex-col", className)}>
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <ProgressIndicator currentPhase={currentPhase} totalPhases={totalPhases} />
        
        <Card className="flex-1 p-6 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-foreground mb-2">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>
          
          <div className="flex flex-col h-full">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};