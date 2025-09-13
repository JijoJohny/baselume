"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { base } from "wagmi/chains";
import { Button } from "~/components/ui/Button";

interface WalletConnectionProps {
  onConnectSuccess?: () => void;
  className?: string;
}

export function WalletConnection({ onConnectSuccess, className = "" }: WalletConnectionProps) {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  // Only trigger success callback when user actively connects (not on page load)
  useEffect(() => {
    if (isConnected && onConnectSuccess && hasConnectedOnce) {
      onConnectSuccess();
    }
  }, [isConnected, onConnectSuccess, hasConnectedOnce]);

  const handleConnect = async (connectorName: string) => {
    setSelectedConnector(connectorName);
    setHasConnectedOnce(true); // Mark that user is actively connecting
    try {
      const targetConnector = connectors.find(c => c.name === connectorName);
      if (targetConnector) {
        await connect({ 
          connector: targetConnector,
          chainId: base.id // Default to Base chain
        });
      }
    } catch (error) {
      console.error(`Failed to connect with ${connectorName}:`, error);
      // Reset selection state on error
      setSelectedConnector(null);
      setHasConnectedOnce(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Filter to only show the specific wallets we want
  const allowedWallets = ['MetaMask', 'Coinbase Wallet'];
  const filteredConnectors = connectors.filter(connector => 
    allowedWallets.includes(connector.name)
  );

  if (isConnected) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="text-center">
          <p className="text-blue-600 text-sm font-medium">Wallet Connected</p>
          <p className="text-xs text-blue-500 mt-1">
            {connector?.name} • {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <Button 
          onClick={handleDisconnect}
          className="w-full bg-black text-white border border-black hover:bg-gray-800"
        >
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  if (!showWalletOptions) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Button 
          onClick={() => setShowWalletOptions(true)}
          className="w-full bg-black text-white border border-black hover:bg-gray-800"
        >
          CONNECT WALLET
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-center">
        <p className="text-blue-600 text-sm mb-3">Choose a wallet to connect:</p>
      </div>

      {filteredConnectors.map((connector) => (
        <Button
          key={connector.name}
          onClick={() => handleConnect(connector.name)}
          disabled={isPending || selectedConnector === connector.name}
          className="w-full bg-black text-white border border-black hover:bg-gray-800 disabled:opacity-50"
        >
          {selectedConnector === connector.name ? 'Connecting...' : `Connect ${connector.name}`}
        </Button>
      ))}

      <Button 
        onClick={() => setShowWalletOptions(false)}
        className="w-full bg-white text-blue-600 border border-black hover:bg-gray-100"
      >
        Back
      </Button>

      {connectError && (
        <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded border border-red-200">
          <p className="font-medium">Connection Failed</p>
          <p className="text-xs mt-1">
            {connectError.message.includes('User rejected') 
              ? 'Connection was cancelled by user'
              : 'Please try again or use a different wallet'
            }
          </p>
        </div>
      )}

      {isPending && (
        <div className="text-blue-600 text-sm text-center p-2 bg-blue-50 rounded border border-blue-200">
          <p>Connecting to wallet...</p>
        </div>
      )}
    </div>
  );
}
