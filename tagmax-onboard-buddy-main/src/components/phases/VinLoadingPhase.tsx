import React, { useEffect } from 'react';
import { PhaseContainer } from '../PhaseContainer';
import { Loader2, Car, Database } from 'lucide-react';

interface VinLoadingPhaseProps {
  onComplete: () => void;
}

export const VinLoadingPhase: React.FC<VinLoadingPhaseProps> = ({ onComplete }) => {
  useEffect(() => {
    // Simulate 4-second loading time
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <PhaseContainer
      currentPhase={0}
      totalPhases={4}
      title="Retrieving Vehicle Information"
      subtitle="Please wait while we validate your vehicle details"
    >
      <div className="flex flex-col items-center justify-center space-y-8 py-12">
        {/* Loading Animation */}
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Database className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4 w-full max-w-sm">
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm">License plate validated</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm font-medium">Retrieving VIN from LicensePlateData.com</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <span className="text-sm text-muted-foreground">Validating vehicle information</span>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-sm">
          <div className="flex items-start space-x-3">
            <Car className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">What we're doing:</p>
              <p className="text-xs text-blue-700">
                We're using your license plate information to retrieve the Vehicle Identification Number (VIN) 
                and validate your vehicle details. This helps ensure your Tag Max device is properly configured.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Retrieving VIN...</span>
            <span>~4 seconds</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </PhaseContainer>
  );
};
