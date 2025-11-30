import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhaseContainer } from '../PhaseContainer';
import { VehicleData } from '@/hooks/useOnboardingFlow';
import { trackLicenseEntryStart, trackLicenseEntryComplete } from '@/services/analytics';
import licensePlateSample from '@/assets/Example license plate.png';

interface LicenseEntryPhaseProps {
  vehicleData: Partial<VehicleData>;
  onUpdate: (data: Partial<VehicleData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const LicenseEntryPhase: React.FC<LicenseEntryPhaseProps> = ({
  vehicleData,
  onUpdate,
  onNext,
  onBack
}) => {
  const [entryMethod, setEntryMethod] = useState<'manual' | 'scan'>('manual');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track license entry phase start
  useEffect(() => {
    trackLicenseEntryStart();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setScanError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Simulate scanning for 5 seconds, then show error and return to manual
      setTimeout(() => {
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsScanning(false);
        setScanError("Unable to scan license plate. Please enter manually.");
        setEntryMethod('manual');
      }, 5000);
      
    } catch (error) {
      setIsScanning(false);
      setScanError("Camera access denied. Please enter manually.");
      setEntryMethod('manual');
    }
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const canProceed = vehicleData.state && vehicleData.licensePlate && vehicleData.licensePlate.length > 0 && consentGiven;

  const handleNext = () => {
    // Track license entry completion
    trackLicenseEntryComplete(vehicleData.state || '', vehicleData.licensePlate || '');
    onNext();
  };

  return (
    <PhaseContainer
      currentPhase={0}
      totalPhases={4}
      title="Confirm Vehicle Details"
      subtitle="Let's get your vehicle information"
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="state">State</Label>
          <Select 
            value={vehicleData.state || ''} 
            onValueChange={(value) => onUpdate({ state: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {vehicleData.state && (
          <>
            <div className="space-y-4">
              <Label>License Plate Entry Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={entryMethod === 'manual' ? 'default' : 'outline'}
                  onClick={() => setEntryMethod('manual')}
                  className="font-medium"
                >
                  Manual Entry
                </Button>
                <Button
                  variant={entryMethod === 'scan' ? 'default' : 'outline'}
                  onClick={() => {
                    setEntryMethod('scan');
                    if (!isScanning) handleScan();
                  }}
                  disabled={isScanning}
                  className="font-medium"
                >
                  {isScanning ? 'Scanning...' : 'Scan Plate'}
                </Button>
              </div>

              {scanError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm">{scanError}</p>
                </div>
              )}

              {isScanning && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black overflow-hidden rounded-md">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* License plate target area */}
                      <div className="absolute inset-8 border-2 border-yellow-400 bg-transparent">
                        <div className="absolute -top-6 left-0 text-yellow-400 text-xs bg-black/50 px-2 py-1">
                          Position license plate within frame
                        </div>
                      </div>
                      
                      {/* Scanning animation */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      
                      {/* Scanning text */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/70 px-4 py-2 rounded">
                        Scanning license plate...
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Point camera at license plate and hold steady...
                  </p>
                </div>
              )}

              {entryMethod === 'manual' && !isScanning && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <img 
                      src={licensePlateSample} 
                      alt="License plate example" 
                      className="w-48 h-32 object-contain border rounded"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licensePlate">License Plate Number</Label>
                    <Input
                      id="licensePlate"
                      placeholder="Enter License Plate (e.g., 215 BG2)"
                      value={vehicleData.licensePlate || ''}
                      onChange={(e) => onUpdate({ licensePlate: e.target.value.toUpperCase() })}
                      className="uppercase font-mono text-center text-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Consent Section - Only show after state is selected */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-2">
                  <Label htmlFor="consent" className="text-sm font-medium leading-relaxed">
                    I consent to CMT using LicensePlateData.com to retrieve VIN information for vehicle validation
                  </Label>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 font-medium mb-1">Important Reminder:</p>
                <p className="text-xs text-blue-700">
                  Please ensure your Tag Max device is installed in this vehicle. For any re-assignment to a different vehicle, 
                  please contact our customer support team at <span className="text-blue-700">solotagsupport@cmtelematics.com</span>
                </p>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 mt-auto">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed}
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
