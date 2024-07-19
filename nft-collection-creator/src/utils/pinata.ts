import axios from 'axios';

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY!;
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY!;

console.log('API Key:', pinataApiKey);
console.log('Secret Key:', pinataSecretApiKey);

const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const testPinataAuthentication = async () => {
  const testEndpoint = 'https://api.pinata.cloud/data/testAuthentication';
  try {
    const response = await axios.get(testEndpoint, {
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });
    console.log('Authentication test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Authentication test failed:', error);
    throw error;
  }
};

export const uploadToPinata = async (file: File) => {
  try {
    // First, test the authentication
    await testPinataAuthentication();

    // If authentication succeeds, proceed with file upload
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        description: 'NFT Image',
      },
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(pinataEndpoint, formData, {
      maxBodyLength: Infinity, // to handle large files
      headers: {
        'Content-Type': `multipart/form-data; boundary=${(formData as any)._boundary}`,
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
      },
    });
    console.log('Upload result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
};
