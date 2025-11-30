// Google Analytics service for Tag Max onboarding funnel tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export interface FunnelEvent {
  phase: string;
  step: string;
  action: 'start' | 'complete' | 'abandon' | 'error';
  data?: any;
}

// Initialize Google Analytics
export const initializeGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('Google Analytics initialized');
    return true;
  }
  console.warn('Google Analytics not loaded');
  return false;
};

// Track funnel progression with detailed conversion data
export const trackFunnelEvent = (event: FunnelEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('Tracking funnel event:', event);
    
    // Track as both custom event and conversion event
    window.gtag('event', 'funnel_progress', {
      event_category: 'onboarding_funnel',
      event_label: `${event.phase}_${event.step}_${event.action}`,
      phase: event.phase,
      step: event.step,
      action: event.action,
      funnel_position: getFunnelPosition(event.phase),
      ...event.data
    });

    // Track as conversion event for funnel analysis
    window.gtag('event', 'conversion', {
      send_to: 'G-LTJ55JB5XS',
      event_category: 'onboarding',
      event_label: `${event.phase}_${event.step}`,
      value: getFunnelValue(event.phase, event.action),
      currency: 'USD',
      phase: event.phase,
      step: event.step,
      action: event.action
    });
  } else {
    console.warn('Google Analytics not available');
  }
};

// Get funnel position for conversion tracking
const getFunnelPosition = (phase: string): number => {
  const positions: { [key: string]: number } = {
    'welcome': 1,
    'vehicle_info': 2,
    'installation': 3,
    'verification': 4,
    'feedback': 5,
    'onboarding': 6
  };
  return positions[phase] || 0;
};

// Get funnel value for conversion tracking
const getFunnelValue = (phase: string, action: string): number => {
  if (action === 'complete') {
    const values: { [key: string]: number } = {
      'welcome': 10,
      'vehicle_info': 20,
      'installation': 30,
      'verification': 40,
      'feedback': 50,
      'onboarding': 100
    };
    return values[phase] || 0;
  }
  return 0;
};

export const trackPageView = (pageName: string, phase?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      phase: phase || 'unknown'
    });
  }
};

export const trackCustomEvent = (eventName: string, parameters: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPhaseStart = (phase: string, step: string, data?: any) => {
  trackFunnelEvent({
    phase,
    step,
    action: 'start',
    data
  });
};

export const trackPhaseComplete = (phase: string, step: string, data?: any) => {
  trackFunnelEvent({
    phase,
    step,
    action: 'complete',
    data
  });
};

export const trackPhaseAbandon = (phase: string, step: string, data?: any) => {
  trackFunnelEvent({
    phase,
    step,
    action: 'abandon',
    data
  });
};

export const trackError = (phase: string, step: string, error: string, data?: any) => {
  trackFunnelEvent({
    phase,
    step,
    action: 'error',
    data: { error, ...data }
  });
};

// Specific funnel tracking functions with detailed data
export const trackWelcomeStart = () => {
  trackPhaseStart('welcome', 'box_id_entry');
  trackPageView('Welcome - Box ID Entry', 'welcome');
};

export const trackWelcomeComplete = (boxId: string) => {
  trackPhaseComplete('welcome', 'box_id_entry', { boxId });
  trackCustomEvent('funnel_step_complete', {
    step_name: 'welcome',
    step_number: 1,
    total_steps: 6,
    box_id: boxId
  });
};

export const trackLicenseEntryStart = () => {
  trackPhaseStart('vehicle_info', 'license_entry');
  trackPageView('Vehicle Info - License Entry', 'vehicle_info');
};

export const trackLicenseEntryComplete = (state: string, licensePlate: string) => {
  trackPhaseComplete('vehicle_info', 'license_entry', { state, licensePlate });
  trackCustomEvent('funnel_step_complete', {
    step_name: 'license_entry',
    step_number: 2,
    total_steps: 6,
    state: state,
    license_plate: licensePlate
  });
};

export const trackVinLoadingStart = () => {
  trackPhaseStart('vehicle_info', 'vin_lookup');
  trackPageView('Vehicle Info - VIN Lookup', 'vehicle_info');
};

export const trackVinLoadingComplete = (vin: string) => {
  trackPhaseComplete('vehicle_info', 'vin_lookup', { vin });
  trackCustomEvent('funnel_step_complete', {
    step_name: 'vin_lookup',
    step_number: 2.5,
    total_steps: 6,
    vin: vin
  });
};

export const trackVehicleConfirmStart = () => {
  trackPhaseStart('vehicle_info', 'vehicle_confirm');
  trackPageView('Vehicle Info - Confirmation', 'vehicle_info');
};

export const trackVehicleConfirmComplete = (vehicleData: any) => {
  trackPhaseComplete('vehicle_info', 'vehicle_confirm', vehicleData);
  trackCustomEvent('funnel_step_complete', {
    step_name: 'vehicle_confirm',
    step_number: 3,
    total_steps: 6,
    vehicle_data: vehicleData
  });
};

export const trackInstallationStart = () => {
  trackPhaseStart('installation', 'device_activation');
  trackPageView('Installation - Device Activation', 'installation');
};

export const trackInstallationComplete = () => {
  trackPhaseComplete('installation', 'device_installation');
  trackCustomEvent('funnel_step_complete', {
    step_name: 'installation',
    step_number: 4,
    total_steps: 6
  });
};

export const trackPhotoUploadStart = () => {
  trackPhaseStart('verification', 'photo_upload');
  trackPageView('Verification - Photo Upload', 'verification');
};

export const trackPhotoUploadComplete = (photoUploaded: boolean) => {
  trackPhaseComplete('verification', 'photo_upload', { photoUploaded });
  trackCustomEvent('funnel_step_complete', {
    step_name: 'photo_upload',
    step_number: 5,
    total_steps: 6,
    photo_uploaded: photoUploaded
  });
};

export const trackCSATStart = () => {
  trackPhaseStart('feedback', 'csat_rating');
  trackPageView('Feedback - CSAT Rating', 'feedback');
};

export const trackCSATComplete = (rating: number, feedback?: string) => {
  trackPhaseComplete('feedback', 'csat_rating', { rating, feedback });
  trackCustomEvent('funnel_step_complete', {
    step_name: 'csat_rating',
    step_number: 6,
    total_steps: 6,
    rating: rating,
    feedback: feedback
  });
};

export const trackOnboardingComplete = () => {
  trackPhaseComplete('onboarding', 'complete');
  trackCustomEvent('funnel_complete', {
    funnel_name: 'tagmax_onboarding',
    completion_rate: 100,
    total_steps: 6
  });
};

export const trackOnboardingAbandon = (phase: string, step: string, reason?: string) => {
  trackPhaseAbandon(phase, step, { reason });
  trackCustomEvent('funnel_abandon', {
    phase: phase,
    step: step,
    reason: reason,
    funnel_name: 'tagmax_onboarding'
  });
};

// Track user journey milestones
export const trackMilestone = (milestone: string, data?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'milestone', {
      event_category: 'user_journey',
      event_label: milestone,
      milestone: milestone,
      ...data
    });
  }
};
