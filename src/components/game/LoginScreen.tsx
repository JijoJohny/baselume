"use client";

import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";
import { WalletConnection } from "./WalletConnection";

interface LoginScreenProps {
  onNavigate: (screen: "main-menu") => void;
  onConnectWallet: () => void;
}

export function LoginScreen({ onNavigate, onConnectWallet }: LoginScreenProps) {
  const { address, isConnected } = useAccount();

  const handleDoCompete = () => {
    if (isConnected) {
      onNavigate("main-menu");
    } else {
      onConnectWallet();
    }
  };

  const handleConnectSuccess = () => {
    // Only navigate to main menu when user explicitly connects wallet
    // Don't auto-navigate on page load
    onNavigate("main-menu");
  };

  // Get the ENS name or truncated address
  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 space-y-6 bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">baselume</h1>
        
        {displayName && (
          <p className="text-lg mb-6 text-blue-600">{displayName}</p>
        )}
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={handleDoCompete}
          className="w-full bg-black text-white border border-black hover:bg-gray-800"
        >
          DO COMPETE
        </Button>
        
        <WalletConnection 
          onConnectSuccess={handleConnectSuccess}
          className="w-full"
        />
      </div>
    </div>
  );
}
