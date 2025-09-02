import { useCallback } from "react";
import nacl from "tweetnacl";
import { storage } from "../utils/storage";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
import { Linking } from "react-native";
import { useMMKVString } from "react-native-mmkv";
import { TransactionClause } from "@vechain/sdk-core";

export const useWallet = () => {
  // const keyPair = storage.getString("user.keyPair");
  const [keyPair] = useMMKVString("user.keyPair", storage.instance);
  const [session] = useMMKVString("user.session", storage.instance);

  const getKeyPair = useCallback(async () => {
    if (keyPair) {
      const keyPairObject = JSON.parse(keyPair);
      return nacl.box.keyPair.fromSecretKey(
        decodeBase64(keyPairObject.privateKey)
      );
    }

    return null;
  }, []);

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
    <T, ET = OnVeWorldError>(
      publicKey: string,
      data: string,
      nonce: string
    ) => {
      if (!keyPair) {
        return {
          errorCode: "-32603",
          errorMessage: "Key pair not found",
        } as ET;
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
          return {
            errorCode: "-32603",
            errorMessage: "Decryption failed: Invalid data or keys",
          } as ET;
        }

        // Convert decrypted Uint8Array to string
        const decryptedDataString = new TextDecoder().decode(decryptedData);

        return JSON.parse(decryptedDataString) as T;
      } catch (error) {
        console.log("----- Error decrypting payload -----");
        const err = error as Error;
        return {
          errorCode: "-32603",
          errorMessage: err.message,
        } as ET;
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

  const onSignTransaction = useCallback(
    async <ET = OnVeWorldError>(clauses: TransactionClause[]) => {
      if (!session) {
        return {
          errorCode: "-32603",
          errorMessage: "Session not found",
        } as ET;
      }

      const keyPair = await getKeyPair();
      if (!keyPair) {
        return {
          errorCode: "-32603",
          errorMessage: "Key pair not found",
        } as ET;
      }

      const payload = {
        transaction: {
          method: "thor_signTransaction",
          message: clauses,
          options: {},
        },
        session: session,
      };

      const nonce = nacl.randomBytes(24);

      const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

      const veWorldPublicKey = await storage.getItem("user.veworldPublicKey");

      if (!veWorldPublicKey) {
        return {
          errorCode: "-32603",
          errorMessage: "VeWorld public key not found",
        } as ET;
      }

      const encryptedPayload = nacl.box(
        payloadBytes,
        nonce,
        decodeBase64(veWorldPublicKey),
        keyPair.secretKey
      );

      const veWorldReq = {
        type: "external-app",
        appName: "My DApp",
        appUrl: "https://mydapp.com",
        icon: window.location.origin + "/src/assets/fiorino.jpeg",
        description: "Sign and send a transaction with VeWorld",
        publicKey: encodeBase64(keyPair.publicKey),
        nonce: encodeBase64(nonce),
        redirectUrl: "mydapp://",
        payload: encodeBase64(encryptedPayload),
      };

      const requestBytes = encodeBase64(
        new TextEncoder().encode(JSON.stringify(veWorldReq))
      );

      const url =
        "https://veworld.com/api/v1/signTransaction?request=" +
        requestBytes.toString();
      Linking.openURL(url);
    },
    []
  );

  return {
    onConnect,
    generateKeyPair,
    decryptPayload,
    onSignTransaction,
  };
};
