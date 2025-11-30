import React from 'react';
import { Button } from '@/components/ui/button';
import { PhaseContainer } from '../PhaseContainer';
import tagMaxPhoto from '@/assets/tag-max-photo.jpg';

interface ApplyPhaseProps {
  onNext: () => void;
  onBack: () => void;
}

export const ApplyPhase: React.FC<ApplyPhaseProps> = ({ onNext, onBack }) => {
  return (
    <PhaseContainer
      currentPhase={1}
      totalPhases={4}
      title="Tag Installation"
      subtitle="Apply your TagMax device"
    >
      <div className="space-y-6">
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary mb-4">
            Step 3
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Apply
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Peel off adhesive backing and place TagMax on the cleaned spot with correct orientation.
          </p>
        </div>

        <div className="space-y-4">
          <img 
            src={tagMaxPhoto} 
            alt="TagMax correct placement example"
            className="w-full max-w-md mx-auto border"
          />
        </div>

          <div className="bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-800 mb-2">Placement Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Press firmly for 30 seconds</li>
              <li>• Check that all edges are adhered</li>
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
            variant="success"
          >
            Continue
          </Button>
        </div>
      </div>
    </PhaseContainer>
  );
};
