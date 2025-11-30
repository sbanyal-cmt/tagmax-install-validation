import React from 'react';
import { Button } from '@/components/ui/button';
import { PhaseContainer } from '../PhaseContainer';
import { Play } from 'lucide-react';

interface ActivatePhaseProps {
  onNext: () => void;
  onBack: () => void;
}

export const ActivatePhase: React.FC<ActivatePhaseProps> = ({ onNext, onBack }) => {
  return (
    <PhaseContainer
      currentPhase={1}
      totalPhases={4}
      title="Tag Installation"
      subtitle="Follow these steps to set up your TagMax"
    >
      <div className="space-y-6">
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary mb-4">
            Step 1
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Activate
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Press the side button for 3 seconds until a green light appears and you hear two short beeps.
          </p>
        </div>

        <div className="bg-muted/20 p-6 border">
          <h4 className="font-medium text-foreground mb-4">Optional: Watch Setup Video</h4>
          <div style={{padding:"56.25% 0 0 0", position:"relative"}}>
            <iframe 
              src="https://player.vimeo.com/video/1117145251?badge=0&autopause=0&player_id=0&app_id=58479" 
              frameBorder="0" 
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              style={{position:"absolute", top:0, left:0, width:"100%", height:"100%"}} 
              title="SoloTag Walkthrough Video"
            />
          </div>
          <script src="https://player.vimeo.com/api/player.js"></script>
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