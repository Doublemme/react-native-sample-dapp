import { useCallback } from "react";
import nacl from "tweetnacl";
import { storage } from "../utils/storage";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
import { Linking } from "react-native";

export const useWallet = () => {
  // const keyPair = storage.getString("user.keyPair");

  const generateKeyPair = useCallback(async () => {
    const keyPair = await storage.getItem("user.keyPair");
    if (keyPair) {
      const keyPairObject = JSON.parse(keyPair);
      return nacl.box.keyPair.fromSecretKey(
        decodeBase64(keyPairObject.privateKey)
      );
    }

    const newKeyPair = nacl.box.keyPair();
    console.log("----- New key pair generated -----");
    console.log(newKeyPair);

    await storage.setItem(
      "user.keyPair",
      JSON.stringify({
        publicKey: encodeBase64(newKeyPair.publicKey),
        privateKey: encodeBase64(newKeyPair.secretKey),
      })
    );

    return newKeyPair;
  }, []);

  const onConnect = useCallback(async () => {
    console.log("----- Generating key pair -----");
    const keyPair = await generateKeyPair();
    console.log("----- Key pair generated -----");

    const message = new URLSearchParams({
      public_key: encodeBase64(keyPair.publicKey),
      app_name: "MyDApp",
      app_url: "https://mydapp.com",
      app_icon:
        "https://www.pngfind.com/pngs/m/508-5088097_icon-template-coloring-page-ios-default-app-icon.png",
      redirect_url: "mydapp://",
      network: "testnet",
    });

    const url = "https://veworld.com/api/v1/connect?" + message.toString();
    Linking.openURL(url);
  }, []);

  return {
    onConnect,
    generateKeyPair,
  };
};
