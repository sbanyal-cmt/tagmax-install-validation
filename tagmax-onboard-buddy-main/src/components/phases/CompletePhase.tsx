import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PhaseContainer } from '../PhaseContainer';
import { CheckCircle, Home, Phone, Mail } from 'lucide-react';

interface CompletePhaseProps {
  licensePlate?: string;
}

export const CompletePhase: React.FC<CompletePhaseProps> = ({ licensePlate }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation on mount
    setShowConfetti(true);
    
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleFinishSetup = () => {
    // Close the browser tab
    window.close();
    
    // Fallback for browsers that don't allow closing
    setTimeout(() => {
      alert('Setup complete! You can now close this tab.');
    }, 100);
  };

  return (
    <PhaseContainer
      currentPhase={3}
      totalPhases={4}
      title="Setup Complete!"
      subtitle="Your Tag Max device is ready to go"
    >
      <div className="space-y-6">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)]
                  }}
                />
              </div>
            ))}
            {[...Array(10)].map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              >
                <div className="text-2xl">✨</div>
              </div>
            ))}
          </div>
        )}

        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🎉 Congratulations!
            </h2>
            <p className="text-muted-foreground">
              Your Tag Max device has been successfully set up and is now tracking your driving.
            </p>
          </div>
        </div>

        {/* Vehicle Information */}
        {licensePlate && (
          <div className="bg-accent/20 border border-accent rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Vehicle Information</h3>
            <p className="text-sm text-muted-foreground">
              License Plate: <span className="font-mono font-semibold">{licensePlate}</span>
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">What's Next?</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Home className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Start Driving</p>
                <p className="text-sm text-blue-700">
                  Your device will automatically begin tracking your driving behavior
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Data Collection</p>
                <p className="text-sm text-green-700">
                  Your driving data will be securely collected and analyzed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-muted/30 border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Call: 1-800-TAG-MAX</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email: solotagsupport@cmtelematics.com</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <Button
            onClick={handleFinishSetup}
            className="w-full text-lg py-6 font-semibold"
            variant="default"
          >
            Finish Setup
          </Button>
        </div>
      </div>
    </PhaseContainer>
  );
};
