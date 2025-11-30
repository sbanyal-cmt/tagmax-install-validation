import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PhaseContainer } from '../PhaseContainer';
import { VehicleData } from '@/hooks/useOnboardingFlow';
import { trackVehicleConfirmStart, trackVehicleConfirmComplete } from '@/services/analytics';
import { Check, Edit, Loader2, Database, Car, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveToGoogleSheets } from '@/services/integrations';

interface LicenseConfirmPhaseProps {
  vehicleData: VehicleData;
  onUpdate: (data: Partial<VehicleData>) => void;
  onNext: () => void;
  onBack: () => void;
  boxId?: string;
  policyId?: string;
}

// US State codes
const STATE_CODES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

// Generate a random VIN (17 characters, following VIN format)
const generateRandomVIN = (): string => {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  
  // First character: Manufacturer (1-5 for North America)
  vin += '1';
  
  // Characters 2-3: Vehicle type and model
  vin += chars[Math.floor(Math.random() * chars.length)];
  vin += chars[Math.floor(Math.random() * chars.length)];
  
  // Characters 4-8: Vehicle attributes
  for (let i = 0; i < 5; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Character 9: Check digit (simplified)
  vin += Math.floor(Math.random() * 10).toString();
  
  // Characters 10-17: Sequential number
  for (let i = 0; i < 8; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return vin;
};

// Generate random vehicle make and model
const generateRandomMake = (): string => {
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volkswagen', 'Lexus', 'Acura'];
  return makes[Math.floor(Math.random() * makes.length)];
};

const generateRandomModel = (make: string): string => {
  const modelMap: { [key: string]: string[] } = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Sienna'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V'],
    'Ford': ['F-150', 'Explorer', 'Escape', 'Mustang', 'Edge', 'Expedition'],
    'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Traverse', 'Camaro'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Frontier'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', '7 Series', 'i3'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7', 'A3', 'TT'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Palisade'],
    'Kia': ['Forte', 'Optima', 'Sportage', 'Sorento', 'Soul', 'Telluride'],
    'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'MX-5', 'CX-30'],
    'Subaru': ['Outback', 'Forester', 'Impreza', 'Legacy', 'Crosstrek', 'Ascent'],
    'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Arteon'],
    'Lexus': ['ES', 'IS', 'RX', 'GX', 'LS', 'NX'],
    'Acura': ['TLX', 'ILX', 'RDX', 'MDX', 'NSX', 'RLX']
  };
  
  const models = modelMap[make] || ['Unknown Model'];
  return models[Math.floor(Math.random() * models.length)];
};

// Generate random license plate
const generateRandomLicensePlate = (): string => {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
  let plate = '';
  for (let i = 0; i < length; i++) {
    plate += chars[Math.floor(Math.random() * chars.length)];
  }
  return plate;
};

// Generate 3-10 random license plate options
const generateLicensePlateOptions = (): string[] => {
  const count = Math.floor(Math.random() * 8) + 3; // 3-10 options
  const options = new Set<string>();
  while (options.size < count) {
    options.add(generateRandomLicensePlate());
  }
  return Array.from(options);
};

export const LicenseConfirmPhase: React.FC<LicenseConfirmPhaseProps> = ({
  vehicleData,
  onUpdate,
  onNext,
  onBack,
  boxId,
  policyId
}) => {
  // Auto-populate all fields with random values
  const [state, setState] = useState(vehicleData.state || STATE_CODES[Math.floor(Math.random() * STATE_CODES.length)]);
  const [licensePlate, setLicensePlate] = useState(vehicleData.licensePlate || generateRandomLicensePlate());
  const [vin, setVin] = useState(vehicleData.vin || generateRandomVIN());
  const [make, setMake] = useState(vehicleData.make || generateRandomMake());
  const [model, setModel] = useState(vehicleData.model || generateRandomModel(vehicleData.make || make));
  const [nickname, setNickname] = useState(vehicleData.nickname || '');
  const [isUploading, setIsUploading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [licensePlateOptions] = useState(() => generateLicensePlateOptions());
  
  // New state for popup overlay
  const [showRetrievingPopup, setShowRetrievingPopup] = useState(false);
  const [originalLicensePlate, setOriginalLicensePlate] = useState(licensePlate);

  const { toast } = useToast();

  // Track vehicle confirm phase start
  useEffect(() => {
    trackVehicleConfirmStart();
  }, []);

  // Handle license plate change - show popup if different
  const handleLicensePlateChange = (newPlate: string) => {
    setLicensePlate(newPlate);
    
    // If the new plate is different from original, show popup
    if (newPlate !== originalLicensePlate) {
      setShowRetrievingPopup(true);
      
      // After 4 seconds, update fields and hide popup
      setTimeout(() => {
        // Randomly update State, VIN, Make, Model
        const newState = STATE_CODES[Math.floor(Math.random() * STATE_CODES.length)];
        const newVIN = generateRandomVIN();
        const newMake = generateRandomMake();
        const newModel = generateRandomModel(newMake);
        
        setState(newState);
        setVin(newVIN);
        setMake(newMake);
        setModel(newModel);
        
        // Update original license plate to new one
        setOriginalLicensePlate(newPlate);
        
        // Hide popup
        setShowRetrievingPopup(false);
      }, 4000);
    }
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
    // Store original license plate when starting to edit
    if (field === 'licensePlate') {
      setOriginalLicensePlate(licensePlate);
    }
  };

  const handleSave = (field: string) => {
    setEditingField(null);
    onUpdate({ 
      state: field === 'state' ? state : vehicleData.state,
      licensePlate: field === 'licensePlate' ? licensePlate : vehicleData.licensePlate,
      vin: field === 'vin' ? vin : vehicleData.vin,
      make: field === 'make' ? make : vehicleData.make,
      model: field === 'model' ? model : vehicleData.model
    });
  };

  const handleCancel = () => {
    setEditingField(null);
    // Reset to original values
    setState(vehicleData.state || STATE_CODES[Math.floor(Math.random() * STATE_CODES.length)]);
    setLicensePlate(vehicleData.licensePlate || generateRandomLicensePlate());
    setVin(vehicleData.vin || generateRandomVIN());
    setMake(vehicleData.make || generateRandomMake());
    setModel(vehicleData.model || generateRandomModel(vehicleData.make || make));
    setShowRetrievingPopup(false);
  };

  const handleConfirm = async () => {
    setIsUploading(true);
    
    try {
      // Track vehicle confirm completion
      trackVehicleConfirmComplete({
        state: state,
        licensePlate: licensePlate,
        vin: vin,
        make: make,
        model: model,
        nickname: nickname
      });
      
      // Update data first
      onUpdate({ 
        state: state,
        licensePlate: licensePlate,
        nickname: nickname.trim() || undefined,
        vin: vin,
        make: make,
        model: model
      });
      
      // Prepare the data to send to Google Sheets
      const dataToSend = {
        boxId: boxId || '',
        state: state || '',
        licensePlate: licensePlate || '',
        nickname: nickname.trim() || '',
        vin: vin || '',
        make: make || '',
        model: model || '',
        dataType: 'vehicle',
        timestamp: new Date().toISOString()
      };

      console.log('=== DIRECT GOOGLE SHEETS SAVE ===');
      console.log('Data being sent:', dataToSend);

      // Save directly to Google Sheets
      const result = await saveToGoogleSheets(dataToSend);
      
      console.log('Google Sheets response:', result);

      toast({
        title: "Vehicle information saved",
        description: "Your Tag Max setup is in progress.",
      });
      
      // Proceed to next phase
      onNext();
    } catch (error) {
      console.error('Google Sheets save error:', error);
      toast({
        title: "Save failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <PhaseContainer
      currentPhase={1}
      totalPhases={4}
      title="Confirm Vehicle Details"
    >
      <div className={`space-y-6 ${showRetrievingPopup ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Policy Number and Box ID Display */}
        {(policyId || boxId) && (
          <div className="text-center">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {policyId && <span>{policyId}</span>}
              {policyId && boxId && <span className="mx-2">|</span>}
              {boxId && <span>Box ID: {boxId}</span>}
            </h3>
          </div>
        )}

        {/* Help Button */}
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" disabled={showRetrievingPopup}>
                <HelpCircle className="w-4 h-4" />
                Help
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Information Mismatch?</AlertDialogTitle>
                <AlertDialogDescription>
                  If there is an information mismatch, please contact Customer Support:
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Phone:</span>
                      <span>1-800-TAG-MAX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email:</span>
                      <span>solotagsupport@cmtelematics.com</span>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Close
                  </Button>
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card className="p-4 bg-accent/20 border-accent">
          <div className="space-y-3">
            {/* License Plate - First Field, Bold */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">License Plate:</span>
              <div className="flex items-center gap-2">
                {editingField === 'licensePlate' ? (
                  <div className="flex items-center gap-1">
                    <Select
                      value={licensePlate}
                      onValueChange={handleLicensePlateChange}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs font-mono">
                        <SelectValue placeholder="Select plate" />
                      </SelectTrigger>
                      <SelectContent>
                        {licensePlateOptions.map((option) => (
                          <SelectItem key={option} value={option} className="font-mono">
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('licensePlate')}
                      className="h-6 w-6 p-0"
                      disabled={showRetrievingPopup}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-6 w-6 p-0"
                      disabled={showRetrievingPopup}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-lg font-bold">
                      {licensePlate}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('licensePlate')}
                      className="h-6 w-6 p-0"
                      disabled={isUploading || showRetrievingPopup}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* State - No Edit Option */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">State:</span>
              <span className="font-mono">{state}</span>
            </div>
            
            {/* VIN - No Edit Option */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">VIN:</span>
              <span className="font-mono text-sm">{vin}</span>
            </div>

            {/* Make - No Edit Option */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Make:</span>
              <span className="font-mono text-sm">{make}</span>
            </div>

            {/* Model - No Edit Option */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Model:</span>
              <span className="font-mono text-sm">{model}</span>
            </div>
          </div>
        </Card>

        <div>
          <Label htmlFor="nickname">Vehicle Nickname (Optional)</Label>
          <Input
            id="nickname"
            placeholder="e.g., My Car, Work Truck, etc."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={50}
            disabled={isUploading || showRetrievingPopup}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Give your vehicle a friendly name for easy identification
          </p>
        </div>

        <div className="flex gap-3 mt-auto">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isUploading || showRetrievingPopup}
          >
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 flex items-center gap-2"
            variant="success"
            disabled={isUploading || showRetrievingPopup}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Retrieving Vehicle Information Popup Overlay */}
      {showRetrievingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border border-border animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              {/* Loading Animation */}
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Database className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Retrieving Vehicle Information</h3>
                <p className="text-sm text-muted-foreground">Please wait while we validate your vehicle details</p>
              </div>

              {/* Loading Steps */}
              <div className="space-y-3 w-full">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                <div className="flex items-start space-x-3">
                  <Car className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
              <div className="w-full">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Retrieving VIN...</span>
                  <span>~4 seconds</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PhaseContainer>
  );
};
