import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { PhaseContainer } from '../PhaseContainer';
import { VehicleData } from '@/hooks/useOnboardingFlow';
import { trackVehicleConfirmStart, trackVehicleConfirmComplete } from '@/services/analytics';
import { Check, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveToGoogleSheets } from '@/services/integrations';

interface LicenseConfirmPhaseProps {
  vehicleData: VehicleData;
  onUpdate: (data: Partial<VehicleData>) => void;
  onNext: () => void;
  onBack: () => void;
  boxId?: string;
}

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

export const LicenseConfirmPhase: React.FC<LicenseConfirmPhaseProps> = ({
  vehicleData,
  onUpdate,
  onNext,
  onBack,
  boxId
}) => {
  const [nickname, setNickname] = useState(vehicleData.nickname || '');
  const [state, setState] = useState(vehicleData.state || '');
  const [licensePlate, setLicensePlate] = useState(vehicleData.licensePlate || '');
  const [vin, setVin] = useState(vehicleData.vin || generateRandomVIN());
  const [make, setMake] = useState(vehicleData.make || generateRandomMake());
  const [model, setModel] = useState(vehicleData.model || generateRandomModel(vehicleData.make || make));
  const [isUploading, setIsUploading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const { toast } = useToast();

  // Track vehicle confirm phase start
  useEffect(() => {
    trackVehicleConfirmStart();
  }, []);

  const handleEdit = (field: string) => {
    setEditingField(field);
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
    setState(vehicleData.state || '');
    setLicensePlate(vehicleData.licensePlate || '');
    setVin(vehicleData.vin || generateRandomVIN());
    setMake(vehicleData.make || generateRandomMake());
    setModel(vehicleData.model || generateRandomModel(vehicleData.make || make));
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
      
      // Prepare the data to send to Google Sheets - FIXED VERSION
      const dataToSend = {
        boxId: boxId || '',
        state: state || '',
        licensePlate: licensePlate || '',
        nickname: nickname.trim() || '', // Changed from undefined to empty string
        vin: vin || '',
        make: make || '',
        model: model || '',
        dataType: 'vehicle',
        timestamp: new Date().toISOString()
      };

      console.log('=== DIRECT GOOGLE SHEETS SAVE ===');
      console.log('Data being sent:', dataToSend);
      console.log('State:', state);
      console.log('Nickname:', nickname);
      console.log('VIN:', vin);
      console.log('Make:', make);
      console.log('Model:', model);
      console.log('Box ID:', boxId);

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
      currentPhase={0}
      totalPhases={4}
      title="Confirm Vehicle Details"
    >
      <div className="space-y-6">
        <Card className="p-4 bg-accent/20 border-accent">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">State:</span>
              <div className="flex items-center gap-2">
                {editingField === 'state' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="h-6 text-xs font-mono w-16"
                      maxLength={2}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('state')}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono">{state}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('state')}
                      className="h-6 w-6 p-0"
                      disabled={isUploading}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">License Plate:</span>
              <div className="flex items-center gap-2">
                {editingField === 'licensePlate' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                      className="h-6 text-xs font-mono w-24"
                      maxLength={10}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('licensePlate')}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-6 w-6 p-0"
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
                      disabled={isUploading}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">VIN:</span>
              <div className="flex items-center gap-2">
                {editingField === 'vin' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      className="h-6 text-xs font-mono w-32"
                      maxLength={17}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('vin')}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-sm">
                      {vin}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('vin')}
                      className="h-6 w-6 p-0"
                      disabled={isUploading}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Make:</span>
              <div className="flex items-center gap-2">
                {editingField === 'make' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="h-6 text-xs w-24"
                      maxLength={20}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('make')}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-sm">
                      {make}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('make')}
                      className="h-6 w-6 p-0"
                      disabled={isUploading}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Model:</span>
              <div className="flex items-center gap-2">
                {editingField === 'model' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="h-6 text-xs w-24"
                      maxLength={20}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('model')}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-sm">
                      {model}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('model')}
                      className="h-6 w-6 p-0"
                      disabled={isUploading}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
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
            disabled={isUploading}
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
            disabled={isUploading}
          >
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 flex items-center gap-2"
            variant="success"
            disabled={isUploading}
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
    </PhaseContainer>
  );
};
