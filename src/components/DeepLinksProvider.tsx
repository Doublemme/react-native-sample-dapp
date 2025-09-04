import React, { useEffect, useRef } from "react";
import { Linking } from "react-native";
import { useWallet } from "../hook";
import { storage } from "../utils";
import { getStateFromPath } from "@react-navigation/native";

type DeepLinksProviderProps = {
  children: React.ReactNode;
};

export const DeepLinksProvider = ({ children }: DeepLinksProviderProps) => {
  const mounted = useRef(false);

  const { decryptPayload } = useWallet();

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      const state = getStateFromPath(url);
      const destructuredPath = state?.routes[0].state?.routes[0].name;

      switch (destructuredPath) {
        case "onVeWorldConnected":
          console.log("----- onVeWorldConnect -----");
          const params = state?.routes[0].state?.routes[0].params as {
            public_key?: string;
            data?: string;
            nonce?: string;
            errorCode?: string;
            errorMessage?: string;
          };
          //TODO: Improve response parsing adding error handling
          if (params?.public_key && params?.data && params?.nonce) {
            const publicKey = params.public_key as string;
            const data = params.data as string;
            const nonce = params.nonce as string;

            decryptPayload<OnVeWorldConnectedData>(publicKey, data, nonce).then(
              (decryptedData) => {
                if (!("errorCode" in decryptedData)) {
                  storage.setItem("user.session", decryptedData.session);
                  storage.setItem("user.address", decryptedData.address);
                  storage.setItem("user.veworldPublicKey", publicKey);
                }
              }
            );
          } else {
            console.log(
              "Error decrypting payload",
              params.errorCode,
              params.errorMessage
            );
          }
          break;
        default:
          console.log("params", destructuredPath);
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
