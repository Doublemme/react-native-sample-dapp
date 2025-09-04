import { Text } from "@react-navigation/elements";
import { StyleSheet, View, Button } from "react-native";
import { storage } from "../../utils/storage";
import { useWallet } from "../../hook";
import { useEffect, useMemo, useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import { sendVETClauses } from "../../utils/demoClauses";

export function Home() {
  const { onConnect, onSignTransaction, onDisconnect } = useWallet();
  const [session] = useMMKVString("user.session", storage.instance);
  const [address] = useMMKVString("user.address", storage.instance);
  const [veworldPublicKey] = useMMKVString(
    "user.veworldPublicKey",
    storage.instance
  );

  const publicKey = useMemo(async () => {
    const value = await storage.getItem("user.keyPair");
    if (!value) return "";
    const keyPair = JSON.parse(value);
    return keyPair.publicKey;
  }, []);

  return (
    <>
      <View style={styles.dataView}>
        <Text>Public Key:</Text>
        <Text>{publicKey}</Text>
      </View>
      <View style={styles.dataView}>
        <Text>VeWorld Public Key:</Text>
        <Text>{veworldPublicKey}</Text>
      </View>

      <View style={styles.dataView}>
        <Text>Session:</Text>
        <Text style={{ fontSize: 12 }}>{session}</Text>
      </View>
      <View style={styles.dataView}>
        <Text>Address:</Text>
        <Text>{address}</Text>
      </View>
      <View style={styles.container}>
        <Button title="Connect Wallet" onPress={onConnect} />
        <Button
          title="Sign Transaction"
          onPress={() => onSignTransaction(sendVETClauses)}
        />
        <Button title="Sign Certificate" onPress={() => {}} />
        <Button title="Sign Typed Data" onPress={() => {}} />
        <Button title="Disconnect Wallet" onPress={onDisconnect} />
        <Button
          title="Clear Storage"
          onPress={() => {
            storage.clearAll();
          }}
        />
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
  dataView: {
    flexDirection: "row",
    gap: 10,
    padding: 10,
    flexWrap: "wrap",
  },
});
