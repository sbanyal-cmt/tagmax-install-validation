// Google Sheets and Drive integration service
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

// Updated endpoint URLs
const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwh5wsMeY-g1hDbFSjQ6HAgx5FNknlUaJjMEOJQ6vf8yRE7a2aKNp3fT42Psk7XdlN5bw/exec';
const GOOGLE_DRIVE_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyPahfS-Q7BXpePuL_YShLpQ-OnE0iU9QW0wdAFnjXqvHC3CHNh0Muk7f-qlrZZCq3pRQ/exec';

export const saveToGoogleSheets = async (data: any) => {
  try {
    console.log('=== Google Sheets Integration Debug ===');
    console.log('Endpoint:', GOOGLE_SHEETS_ENDPOINT);
    console.log('Data to send:', data);
    
    const payload = new URLSearchParams();
    payload.append('data', JSON.stringify(data));
    
    console.log('Payload:', payload.toString());

    const response = await fetch(GOOGLE_SHEETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Response JSON:', result);
    
    if (!result.ok) {
      console.error('Google Sheets returned error:', result.error);
      throw new Error(result.error || 'Failed to save to Google Sheets');
    }

    console.log('✅ Google Sheets save successful');
    return result;
  } catch (error) {
    console.error('❌ Google Sheets save error:', error);
    throw new Error(`Failed to save to Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const uploadToGoogleDrive = async (file: File, licensePlate: string) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

        const payload = new URLSearchParams();
        payload.append('data', JSON.stringify({
          imageBase64: base64Data,
          contentType: file.type,
          licensePlate: licensePlate
        }));

        const response = await fetch(GOOGLE_DRIVE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: payload,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.ok) {
          throw new Error(result.error || 'Failed to upload to Google Drive');
        }

        resolve(result.webViewLink || result.fileUrl || 'Upload successful');
      } catch (error) {
        console.error('Google Drive upload error:', error);
        reject(new Error(`Failed to upload to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
