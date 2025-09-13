"use client";

import { useAccount, useConnect } from "wagmi";

export function WalletDebug() {
  const { address, isConnected, connector, chainId } = useAccount();
  const { connectors, error } = useConnect();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white text-xs p-3 rounded-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">Wallet Debug Info</h3>
      <div className="space-y-1">
        <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
        <div>Chain ID: {chainId}</div>
        <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</div>
        <div>Connector: {connector?.name || 'None'}</div>
        {error && (
          <div className="text-red-400">
            Error: {error.message}
          </div>
        )}
        <div className="pt-2 border-t border-gray-600">
          <div className="font-medium">Available Connectors:</div>
          {connectors.map((c) => (
            <div key={c.name} className="ml-2">• {c.name}</div>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-600">
          <div className="font-medium">Browser Info:</div>
          <div>MetaMask: {typeof window !== 'undefined' && window.ethereum?.isMetaMask ? 'Detected' : 'Not found'}</div>
          <div>Coinbase: {typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet ? 'Detected' : 'Not found'}</div>
        </div>
      </div>
    </div>
  );
}
