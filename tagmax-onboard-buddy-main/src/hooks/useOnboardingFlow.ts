import { useState, useCallback } from 'react';

export interface VehicleData {
  state: string;
  licensePlate: string;
  nickname?: string;
  vin?: string;
  make?: string;
  model?: string;
}

export interface CSATData {
  rating: number;
  feedback?: string;
}

export interface OnboardingData {
  boxId?: string;
  policyId?: string;
  vehicle: VehicleData;
  installationPhoto?: File;
  csat: CSATData;
}

type Phase = 'welcome' | 'license-confirm' | 'photo-upload' | 'csat' | 'complete';

export const useOnboardingFlow = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('welcome');
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const updateBoxId = useCallback((boxId: string) => {
    setData(prev => ({
      ...prev,
      boxId: boxId
    }));
  }, []);

  const updatePolicyId = useCallback((policyId: string) => {
    setData(prev => ({
      ...prev,
      policyId: policyId
    }));
  }, []);

  const updateVehicleData = useCallback((vehicleData: Partial<VehicleData>) => {
    setData(prev => ({
      ...prev,
      vehicle: { ...prev.vehicle, ...vehicleData } as VehicleData
    }));
  }, []);

  const updateInstallationPhoto = useCallback((photo: File) => {
    setData(prev => ({
      ...prev,
      installationPhoto: photo
    }));
  }, []);

  const updateCSATData = useCallback((csatData: Partial<CSATData>) => {
    setData(prev => ({
      ...prev,
      csat: { ...prev.csat, ...csatData } as CSATData
    }));
  }, []);

  const nextPhase = useCallback(() => {
    const phases: Phase[] = [
      'welcome', 
      'license-confirm', 
      'photo-upload', 
      'csat', 
      'complete'
    ];
    
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
    }
  }, [currentPhase]);

  const prevPhase = useCallback(() => {
    const phases: Phase[] = [
      'welcome', 
      'license-confirm', 
      'photo-upload', 
      'csat', 
      'complete'
    ];
    
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1]);
    }
  }, [currentPhase]);

  const jumpToPhase = useCallback((phase: Phase) => {
    setCurrentPhase(phase);
  }, []);

  const getPhaseNumber = () => {
    const phaseMapping: Record<Phase, number> = {
      'welcome': 0,
      'license-confirm': 1,
      'photo-upload': 2,
      'csat': 3,
      'complete': 3
    };
    return phaseMapping[currentPhase];
  };

  // Real Google Sheets API integration
  const saveToGoogleSheets = useCallback(async (sheetData: any) => {
    const { saveToGoogleSheets: saveToSheets } = await import('../services/integrations');
    return saveToSheets({
      timestamp: new Date().toISOString(),
      ...sheetData
    });
  }, []);

  // Real Google Drive API integration  
  const uploadToGoogleDrive = useCallback(async (file: File, licensePlate: string) => {
    const { uploadToGoogleDrive: uploadToDrive } = await import('../services/integrations');
    return uploadToDrive(file, licensePlate);
  }, []);

  return {
    currentPhase,
    data,
    updateBoxId,
    updatePolicyId,
    updateVehicleData,
    updateInstallationPhoto,
    updateCSATData,
    nextPhase,
    prevPhase,
    jumpToPhase,
    getPhaseNumber,
    saveToGoogleSheets,
    uploadToGoogleDrive
  };
};
