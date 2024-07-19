import axios from 'axios';

const pinataApiKey = '782a09033690f0b16da5';
const pinataSecretApiKey = '0065a73b35ebcc8b60394633e9a5ad1aabf3ec6490df6785a3d40cc8b27f533e';
const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const uploadToPinata = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
            description: 'NFT Image'
        }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0
    });
    formData.append('pinataOptions', options);

    try {
        const response = await axios.post(pinataEndpoint, formData, {
            maxBodyLength: 'Infinity', // to handle large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file to Pinata:', error);
        throw error;
    }
};
