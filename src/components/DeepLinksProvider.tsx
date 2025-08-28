import React, { useEffect, useRef } from "react";
import { Linking } from "react-native";

type DeepLinksProviderProps = {
  children: React.ReactNode;
};

export const DeepLinksProvider = ({ children }: DeepLinksProviderProps) => {
  const mounted = useRef(false);

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const destructuredPath = path.split("/");

      console.log("----- destructuredPath -----", destructuredPath);

      switch (destructuredPath[1]) {
        case "onVeWorldConnected":
          console.log("----- onVeWorldConnect -----");
          console.log(urlObj.searchParams.toString());
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
