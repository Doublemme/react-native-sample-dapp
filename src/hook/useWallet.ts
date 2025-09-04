import { useCallback, useEffect } from "react";
import nacl from "tweetnacl";
import { storage } from "../utils/storage";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
import { Linking } from "react-native";
import { useMMKVString } from "react-native-mmkv";
import { TransactionClause } from "@vechain/sdk-core";

export const useWallet = () => {
  // const keyPair = storage.getString("user.keyPair");
  const [session] = useMMKVString("user.session", storage.instance);

  const getKeyPair = useCallback(async () => {
    const keyPair = await storage.getItem("user.keyPair");
    if (keyPair) {
      const keyPairObject = JSON.parse(keyPair);
      return nacl.box.keyPair.fromSecretKey(
        decodeBase64(keyPairObject.privateKey)
      );
    }

    return null;
  }, []);

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

    storage.setItem(
      "user.keyPair",
      JSON.stringify({
        publicKey: encodeBase64(newKeyPair.publicKey),
        privateKey: encodeBase64(newKeyPair.secretKey),
      })
    );

    return newKeyPair;
  }, []);

  const decryptPayload = useCallback(
    async <T, ET = OnVeWorldError>(
      publicKey: string,
      data: string,
      nonce: string
    ) => {
      const keyPair = await getKeyPair();
      if (!keyPair) {
        return {
          errorCode: "-32603",
          errorMessage: "Key pair not found",
        } as ET;
      }

      try {
        const naclKeyPair = nacl.box.keyPair.fromSecretKey(keyPair.secretKey);

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

    if (!keyPair) {
      return {
        errorCode: "-32603",
        errorMessage: "Key pair not found",
      } as OnVeWorldError;
    }

    const message = new URLSearchParams({
      public_key: encodeBase64(keyPair.publicKey),
      app_name: "MyDApp",
      app_url: "https://mydapp.com",
      app_icon:
        "https://www.pngfind.com/pngs/m/508-5088097_icon-template-coloring-page-ios-default-app-icon.png",
      redirect_url: "mydapp://onVeWorldConnected",
      network: "testnet",
    });

    const url = "https://veworld.com/api/v1/connect?" + message.toString();
    Linking.openURL(url);
  }, []);

  const onSignTransaction = useCallback(
    async <ET = OnVeWorldError>(clauses: TransactionClause[]) => {
      console.log("YO");
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

      console.log("url", url);
      await Linking.openURL(url);
    },
    []
  );

  const onDisconnect = useCallback(async () => {
    const payload = {
      session: session,
    };

    const keyPair = await getKeyPair();
    if (!keyPair) {
      return {
        errorCode: "-32603",
        errorMessage: "Key pair not found",
      } as OnVeWorldError;
    }

    const veWorldPublicKey = await storage.getItem("user.veworldPublicKey");
    if (!veWorldPublicKey) {
      return {
        errorCode: "-32603",
        errorMessage: "VeWorld public key not found",
      } as OnVeWorldError;
    }

    const nonce = nacl.randomBytes(24);
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
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
      description: "Disconnect from VeWorld",
      publicKey: encodeBase64(keyPair.publicKey),
      nonce: encodeBase64(nonce),
      redirectUrl: "mydapp://onVeWorldDisconnected",
      network: "testnet",
      payload: encodeBase64(encryptedPayload),
    };

    const requestBytes = encodeBase64(
      new TextEncoder().encode(JSON.stringify(veWorldReq))
    );

    const url =
      `https://veworld.com/api/v1/disconnect?request=` +
      requestBytes.toString();

    Linking.openURL(url);

    //TODO: Do this only on disconnect response
    await storage.removeItem("user.keyPair");
    await storage.removeItem("user.session");
    await storage.removeItem("user.veworldPublicKey");
    await storage.removeItem("user.address");
  }, []);

  useEffect(() => {
    generateKeyPair();
  }, []);

  return {
    onConnect,
    onDisconnect,
    generateKeyPair,
    decryptPayload,
    onSignTransaction,
  };
};
