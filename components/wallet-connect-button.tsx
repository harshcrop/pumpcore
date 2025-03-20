"use client";

import { ConnectKitButton } from "connectkit";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName }) => {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={show}
            className="bg-gray-900 border-gray-700 hover:bg-gray-800"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isConnected ? (
              <span className="font-mono text-xs">
                {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </span>
            ) : isConnecting ? (
              "Connecting..."
            ) : (
              "Connect Wallet"
            )}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
