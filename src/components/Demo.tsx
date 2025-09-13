"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
  useSwitchChain,
  useChainId,
} from "wagmi";

import { ShareButton } from "./ui/Share";

import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, degen, mainnet, optimism, unichain } from "wagmi/chains";
import { BaseError, UserRejectedRequestError } from "viem";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import { USE_WALLET, APP_NAME } from "~/lib/constants";

// Game screen components
import { LoginScreen } from "./game/LoginScreen";
import { MainMenuScreen } from "./game/MainMenuScreen";
import { PrivateRoomsScreen } from "./game/PrivateRoomsScreen";
import { JoinRoomScreen } from "./game/JoinRoomScreen";
import { CreateRoomScreen } from "./game/CreateRoomScreen";
import { GameLobbyScreen } from "./game/GameLobbyScreen";
import { GameSubmissionScreen } from "./game/GameSubmissionScreen";

export type GameScreen = "login" | "main-menu" | "private-rooms" | "join-room" | "create-room" | "game-lobby" | "game-submission";

interface NeynarUser {
  fid: number;
  score: number;
}

interface GameState {
  currentScreen: GameScreen;
  roomCode: string;
  participants: string[];
  gameName: string;
  isHost: boolean;
}

export default function Demo(
  { title }: { title?: string } = { title: "baselume" }
) {
  const { isSDKLoaded, context, added, notificationDetails, actions } =
    useMiniApp();
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: "login",
    roomCode: "",
    participants: [],
    gameName: "",
    isHost: false,
  });
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sendNotificationResult, setSendNotificationResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Navigation functions
  const navigateToScreen = (screen: GameScreen) => {
    setGameState(prev => ({ ...prev, currentScreen: screen }));
  };

  const handleConnectWallet = () => {
    // Wallet connection logic will be handled by individual screens
    console.log("Connecting wallet...");
  };

  const handlePlayNow = () => {
    // Direct play functionality
    navigateToScreen("game-submission");
  };

  useEffect(() => {
    console.log("isSDKLoaded", isSDKLoaded);
    console.log("context", context);
    console.log("address", address);
    console.log("isConnected", isConnected);
    console.log("chainId", chainId);
  }, [context, address, isConnected, chainId, isSDKLoaded]);

  // Fetch Neynar user object when context is available
  useEffect(() => {
    const fetchNeynarUserObject = async () => {
      if (context?.user?.fid) {
        try {
          const response = await fetch(`/api/users?fids=${context.user.fid}`);
          const data = await response.json();
          if (data.users?.[0]) {
            setNeynarUser(data.users[0]);
          }
        } catch (error) {
          console.error("Failed to fetch Neynar user object:", error);
        }
      }
    };

    fetchNeynarUserObject();
  }, [context?.user?.fid]);

  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  const {
    signTypedData,
    error: signTypedError,
    isError: isSignTypedError,
    isPending: isSignTypedPending,
  } = useSignTypedData();

  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
    isPending: isSwitchChainPending,
  } = useSwitchChain();

  const nextChain = useMemo(() => {
    if (chainId === base.id) {
      return optimism;
    } else if (chainId === optimism.id) {
      return degen;
    } else if (chainId === degen.id) {
      return mainnet;
    } else if (chainId === mainnet.id) {
      return unichain;
    } else {
      return base;
    }
  }, [chainId]);

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: nextChain.id });
  }, [switchChain, nextChain.id]);

  const sendNotification = useCallback(async () => {
    setSendNotificationResult("");
    if (!notificationDetails || !context) {
      return;
    }

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: context.user.fid,
          notificationDetails,
        }),
      });

      if (response.status === 200) {
        setSendNotificationResult("Success");
        return;
      } else if (response.status === 429) {
        setSendNotificationResult("Rate limited");
        return;
      }

      const data = await response.text();
      setSendNotificationResult(`Error: ${data}`);
    } catch (error) {
      setSendNotificationResult(`Error: ${error}`);
    }
  }, [context, notificationDetails]);

  const sendTx = useCallback(() => {
    sendTransaction(
      {
        // call yoink() on Yoink contract
        to: "0x4bBFD120d9f352A0BEd7a014bd67913a2007a878",
        data: "0x9846cd9efc000023c0",
      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);
        },
      }
    );
  }, [sendTransaction]);

  const signTyped = useCallback(() => {
    signTypedData({
      domain: {
        name: APP_NAME,
        version: "1",
        chainId,
      },
      types: {
        Message: [{ name: "content", type: "string" }],
      },
      message: {
        content: `Hello from ${APP_NAME}!`,
      },
      primaryType: "Message",
    });
  }, [chainId, signTypedData]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  // Render the appropriate screen based on current state
  const renderCurrentScreen = () => {
    switch (gameState.currentScreen) {
      case "login":
        return (
          <LoginScreen
            onNavigate={navigateToScreen}
            onConnectWallet={handleConnectWallet}
          />
        );
      
      case "main-menu":
        return (
          <MainMenuScreen
            onNavigate={navigateToScreen}
            onPlayNow={handlePlayNow}
          />
        );
      
      case "private-rooms":
        return (
          <PrivateRoomsScreen
            onNavigate={navigateToScreen}
          />
        );
      
      case "join-room":
        return (
          <JoinRoomScreen
            onNavigate={navigateToScreen}
            onBack={() => navigateToScreen("private-rooms")}
          />
        );
      
      case "create-room":
        return (
          <CreateRoomScreen
            onNavigate={navigateToScreen}
            onBack={() => navigateToScreen("private-rooms")}
          />
        );
      
      case "game-lobby":
        return (
          <GameLobbyScreen
            onNavigate={navigateToScreen}
            onBack={() => navigateToScreen("main-menu")}
            isHost={gameState.isHost}
            participants={gameState.participants}
            gameName={gameState.gameName}
          />
        );
      
      case "game-submission":
        return (
          <GameSubmissionScreen
            onNavigate={navigateToScreen}
            onBack={() => navigateToScreen("main-menu")}
          />
        );
      
      default:
        return (
          <LoginScreen
            onNavigate={navigateToScreen}
            onConnectWallet={handleConnectWallet}
          />
        );
    }
  };

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="mx-auto py-2 px-4 pb-20 h-screen">
        {renderCurrentScreen()}
      </div>
    </div>
  );
}

function SignEvmMessage() {
  const { isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const {
    signMessage,
    data: signature,
    error: signError,
    isError: isSignError,
    isPending: isSignPending,
  } = useSignMessage();

  const handleSignMessage = useCallback(async () => {
    if (!isConnected) {
      await connectAsync({
        chainId: base.id,
        connector: config.connectors[0],
      });
    }

    signMessage({ message: "Hello from Frames v2!" });
  }, [connectAsync, isConnected, signMessage]);

  return (
    <>
      <Button
        onClick={handleSignMessage}
        disabled={isSignPending}
        isLoading={isSignPending}
      >
        Sign Message
      </Button>
      {isSignError && renderError(signError)}
      {signature && (
        <div className="mt-2 text-xs">
          <div>Signature: {signature}</div>
        </div>
      )}
    </>
  );
}

function SendEth() {
  const { isConnected, chainId } = useAccount();
  const {
    sendTransaction,
    data,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const toAddr = useMemo(() => {
    // Protocol guild address
    return chainId === base.id
      ? "0x32e3C7fD24e175701A35c224f2238d18439C7dBC"
      : "0xB3d8d7887693a9852734b4D25e9C0Bb35Ba8a830";
  }, [chainId]);

  const handleSend = useCallback(() => {
    sendTransaction({
      to: toAddr,
      value: 1n,
    });
  }, [toAddr, sendTransaction]);

  return (
    <>
      <Button
        onClick={handleSend}
        disabled={!isConnected || isSendTxPending}
        isLoading={isSendTxPending}
      >
        Send Transaction (eth)
      </Button>
      {isSendTxError && renderError(sendTxError)}
      {data && (
        <div className="mt-2 text-xs">
          <div>Hash: {truncateAddress(data)}</div>
          <div>
            Status:{" "}
            {isConfirming
              ? "Confirming..."
              : isConfirmed
              ? "Confirmed!"
              : "Pending"}
          </div>
        </div>
      )}
    </>
  );
}

const renderError = (error: Error | null) => {
  if (!error) return null;
  if (error instanceof BaseError) {
    const isUserRejection = error.walk(
      (e) => e instanceof UserRejectedRequestError
    );

    if (isUserRejection) {
      return <div className="text-red-500 text-xs mt-1">Rejected by user.</div>;
    }
  }

  return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
};
