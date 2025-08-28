import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

/**
 * Loads an image and returns it as a base64 string
 * @param imagePath - The path to the image relative to the assets folder (e.g. "@icon.png")
 * @returns Promise<string> - The base64 encoded image data with data URI prefix
 */
export async function loadImageAsBase64(imagePath: string): Promise<string> {
  try {
    // Remove @ symbol if present
    const cleanPath = imagePath.startsWith("@")
      ? imagePath.slice(1)
      : imagePath;

    // Construct the full path to the asset
    const assetPath = Platform.select({
      web: `/assets/${cleanPath}`,
      default: `${FileSystem.documentDirectory}assets/${cleanPath}`,
    });

    if (Platform.OS === "web") {
      // For web, fetch the image and convert to base64
      const response = await fetch(assetPath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // For native platforms, use FileSystem
      const base64 = await FileSystem.readAsStringAsync(assetPath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/png;base64,${base64}`;
    }
  } catch (error) {
    console.error("Error loading image as base64:", error);
    throw error;
  }
}
