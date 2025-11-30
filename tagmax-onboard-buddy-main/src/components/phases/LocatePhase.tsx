import React from 'react';
import { Button } from '@/components/ui/button';
import { PhaseContainer } from '../PhaseContainer';
import locateInstructions from '@/assets/locate-instructions.png';

interface LocatePhaseProps {
  onNext: () => void;
  onBack: () => void;
}

export const LocatePhase: React.FC<LocatePhaseProps> = ({ onNext, onBack }) => {
  return (
    <PhaseContainer
      currentPhase={1}
      totalPhases={4}
      title="Tag Installation"
      subtitle="Choose the right location for your TagMax"
    >
      <div className="space-y-6">
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary mb-4">
            Step 2
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Locate
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Choose and clean a spot on the inside of your windshield (using alcohol pad). Must have sunlight for self-charging.
          </p>
        </div>

        <div className="space-y-4">
          <img 
            src={locateInstructions} 
            alt="TagMax location instructions"
            className="w-full max-w-md mx-auto border"
          />
        </div>

          <div className="bg-amber-50 border border-amber-200 p-4">
            <h4 className="font-medium text-amber-800 mb-2">Important Guidelines:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Avoid stickers, tint, or obstructing driver view</li>
              <li>• Choose area with direct sunlight exposure</li>
            </ul>
          </div>

        <div className="flex gap-3 mt-auto">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 font-semibold"
            variant="default"
          >
            Continue
          </Button>
        </div>
      </div>
    </PhaseContainer>
  );
};
