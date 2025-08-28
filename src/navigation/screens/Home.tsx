import { Text } from "@react-navigation/elements";
import { StyleSheet, View, Button } from "react-native";
import { storage } from "../../utils/storage";
import { useWallet } from "../../hook";
import { useEffect, useMemo, useState } from "react";
import { useMMKVString } from "react-native-mmkv";

export function Home() {
  const { onConnect } = useWallet();

  const publicKey = useMemo(async () => {
    const value = await storage.getItem("user.keyPair");
    if (!value) return "";
    const keyPair = JSON.parse(value);
    return keyPair.publicKey;
  }, []);

  return (
    <>
      <View
        style={{ flexDirection: "row", gap: 10, padding: 10, flexWrap: "wrap" }}
      >
        <Text>Public Key:</Text>
        <Text>{publicKey}</Text>
      </View>
      <View style={styles.container}>
        <Button title="Connect Wallet" onPress={onConnect} />
        <Button title="Send Transaction" onPress={() => {}} />
        <Button title="Sign Certificate" onPress={() => {}} />
        <Button title="Sign Typed Data" onPress={() => {}} />
        <Button title="Disconnect Wallet" onPress={() => {}} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
