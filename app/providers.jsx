"use client";

import React, { useEffect, useState } from "react";
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { getDefaultConfig, ConnectKitProvider } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Define Core DAO networks
const coreDaoTestnet = {
  id: 1115,
  name: "Core Blockchain Testnet",
  network: "core-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tCORE2",
    symbol: "tCORE2",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.test.btcs.network"],
    },
    public: {
      http: ["https://rpc.test.btcs.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Core Testnet Explorer",
      url: "https://scan.test.btcs.network",
    },
  },
  testnet: true,
};

const coreDaoMainnet = {
  id: 1116,
  name: "Core Blockchain",
  network: "core-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "CORE",
    symbol: "CORE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.coredao.org"],
    },
    public: {
      http: ["https://rpc.coredao.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Core Explorer",
      url: "https://scan.coredao.org",
    },
  },
  testnet: false,
};

// Restrict the list of supported chains to ONLY Core DAO networks
const chains = [coreDaoTestnet, coreDaoMainnet];

// Create Wagmi Config with ConnectKit
const config = createConfig(
  getDefaultConfig({
    appName: "Modern Pump.fun Clone",
    chains,
    transports: {
      [coreDaoTestnet.id]: http(coreDaoTestnet.rpcUrls.default.http[0]),
      [coreDaoMainnet.id]: http(coreDaoMainnet.rpcUrls.default.http[0]),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_PROJECTID,
    ssr: false, // Disable SSR to prevent hydration errors
  })
);

// Create a QueryClient instance
const queryClient = new QueryClient();

// Component to enforce Core DAO networks and provide network switching
function NetworkEnforcer() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chainId !== 1115 && chainId !== 1116) {
      // Show a modal or notification that only Core DAO networks are supported
      const preferredChain = window.confirm(
        "This application only supports Core DAO networks. Would you like to switch to Core DAO Testnet? (Click Cancel for Mainnet)"
      )
        ? coreDaoTestnet
        : coreDaoMainnet;

      try {
        switchChain({ chainId: preferredChain.id });
      } catch (error) {
        console.error("Failed to switch chain:", error);
        alert(
          `Please manually switch to ${preferredChain.name} (Chain ID: ${preferredChain.id}) in your wallet.`
        );
      }
    }
  }, [chainId, isConnected, switchChain]);

  return null;
}

// Custom ConnectKit theme to emphasize Core DAO branding
const customTheme = {
  "--ck-connectbutton-background": "#6c5ce7",
  "--ck-connectbutton-hover-background": "#5b4bc7",
  "--ck-connectbutton-active-background": "#4a3aae",
  "--ck-connectbutton-color": "#ffffff",
  "--ck-body-background": "#1e1e2e",
  "--ck-body-color": "#ffffff",
  "--ck-focus-color": "#6c5ce7",
  "--ck-overlay-background": "rgba(0, 0, 0, 0.8)",
  "--ck-secondary-button-background": "#2d2d3d",
};

// Wrap Providers including ConnectKit and QueryClientProvider
export function Providers({ children }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ConnectKitProvider
          theme="midnight"
          customTheme={customTheme}
          options={{
            hideNoWalletCTA: false,
            hideBalance: false,
            embedGoogleFonts: true,
            // Restrict network switching to only Core DAO networks
            walletConnectCTA: "scan",
            // Display a message about network restrictions
            initialChainId: 1115,
          }}
        >
          <NetworkEnforcer />
          {children}
        </ConnectKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
