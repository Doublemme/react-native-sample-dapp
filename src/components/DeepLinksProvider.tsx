import React, { useEffect, useRef } from "react";
import { Linking } from "react-native";
import { useWallet } from "../hook";

type DeepLinksProviderProps = {
  children: React.ReactNode;
};

export const DeepLinksProvider = ({ children }: DeepLinksProviderProps) => {
  const mounted = useRef(false);

  const { decryptPayload } = useWallet();

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const destructuredPath = path.split("/");

      switch (destructuredPath[1]) {
        case "onVeWorldConnected":
          console.log("----- onVeWorldConnect -----");
          //TODO: Improve response parsing adding error handling
          if (
            urlObj.searchParams.has("public_key") &&
            urlObj.searchParams.has("data") &&
            urlObj.searchParams.has("nonce")
          ) {
            const publicKey = urlObj.searchParams.get("public_key") as string;
            const data = urlObj.searchParams.get("data") as string;
            const nonce = urlObj.searchParams.get("nonce") as string;
            const decryptedData = decryptPayload<OnVeWorldConnectedData>(
              publicKey,
              data,
              nonce
            );
            console.log(decryptedData);
          }
          break;
        default:
          return;
      }
    };

    Linking.addEventListener("url", handleDeepLink);

    if (!mounted.current) {
      mounted.current = true;
      Linking.getInitialURL().then((url) => url && handleDeepLink({ url }));
    }

    return () => {
      Linking.removeAllListeners("url");
    };
  }, []);

  return <>{children}</>;
};
