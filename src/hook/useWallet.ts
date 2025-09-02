import { useCallback } from "react";
import nacl from "tweetnacl";
import { storage } from "../utils/storage";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
import { Linking } from "react-native";
import { useMMKVString } from "react-native-mmkv";

export const useWallet = () => {
  // const keyPair = storage.getString("user.keyPair");
  const [keyPair] = useMMKVString("user.keyPair", storage.getInstance());

  const generateKeyPair = useCallback(async () => {
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

  const decryptPayload = useCallback(
    <T>(publicKey: string, data: string, nonce: string) => {
      if (!keyPair) {
        return;
      }

      const keyPairObject: KeyPair = JSON.parse(keyPair);

      try {
        const naclKeyPair = nacl.box.keyPair.fromSecretKey(
          decodeBase64(keyPairObject.privateKey)
        );

        const decryptedData = nacl.box.open(
          decodeBase64(data),
          decodeBase64(nonce),
          decodeBase64(publicKey),
          naclKeyPair.secretKey
        );

        if (!decryptedData) {
          return "Decryption failed: Invalid data or keys";
        }

        // Convert decrypted Uint8Array to string
        const decryptedDataString = new TextDecoder().decode(decryptedData);

        return JSON.parse(decryptedDataString) satisfies T;
      } catch (error) {
        console.log("----- Error decrypting payload -----");
        console.log(error);
        return;
      }
    },
    []
  );

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
    decryptPayload,
  };
};
