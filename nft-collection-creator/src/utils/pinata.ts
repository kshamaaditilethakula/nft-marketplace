import axios from "axios";

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY ?? "e38a059d393507251c05";
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY ?? "ea54032077fd4504ec8daa43e6abe81a1e7bf1676c256e732c302c6d223ff1f9";

const pinataEndpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export const uploadToPinata = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      description: "NFT Image",
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", options);

  const response = await axios.post(pinataEndpoint, formData, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${(formData as any)._boundary}`,
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
    },
  });

  return response.data;
};
