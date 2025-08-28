import { Text } from "@react-navigation/elements";
import { StyleSheet, View } from "react-native";
import { ProfileScreenProps } from "../index";

export function Profile({ route }: ProfileScreenProps) {
  return (
    <View style={styles.container}>
      <Text>{route.params.userId ?? "Anonymous"}'s Profile</Text>
    </View>
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
