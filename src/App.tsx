import { Assets as NavigationAssets } from "@react-navigation/elements";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { MyStack } from "./navigation";
import { NavigationContainer } from "@react-navigation/native";
import { DeepLinksProvider } from "./components";

Asset.loadAsync([
  ...NavigationAssets,
  require("./assets/newspaper.png"),
  require("./assets/bell.png"),
]);

SplashScreen.preventAutoHideAsync();

export function App() {
  return (
    <NavigationContainer
      linking={{
        prefixes: ["mydapp://", "https://mydapp.com"],
        config: {
          screens: {
            Home: {
              path: "home",
            },
          },
        },
      }}
      onReady={() => {
        SplashScreen.hideAsync();
      }}
    >
      <DeepLinksProvider>
        <MyStack />
      </DeepLinksProvider>
    </NavigationContainer>
  );
}
