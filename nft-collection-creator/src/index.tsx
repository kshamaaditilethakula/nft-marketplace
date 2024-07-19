import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { mainnet, goerli, sepolia } from 'wagmi/chains';
import App from './App';
import './index.css';

const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_URL || 'your-api-key';

// Configure chains & providers with the Alchemy API key
const { provider, chains } = configureChains(
  [mainnet, goerli, sepolia],
  [alchemyProvider({ apiKey: alchemyApiKey }), publicProvider()]
);

// Set up wagmi client
const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
  ],
  provider,
});

// Render the app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
