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
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">baselume</h1>
        <p className="text-sm text-blue-600">Competitive Gaming Platform</p>
        
        {displayName && (
          <p className="text-sm mt-4 text-blue-600 font-medium">{displayName}</p>
        )}
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={handleDoCompete}
          className="w-full bg-black text-white hover:bg-gray-800"
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
