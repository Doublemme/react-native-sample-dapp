import { MMKV } from "react-native-mmkv";

export const newStorage = (mmkv: MMKV) => ({
  setItem: (key: string, value: string) => {
    mmkv.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = mmkv.getString(key);
    return Promise.resolve(value);
  },
  removeItem(key: string): any {
    mmkv.delete(key);
    return Promise.resolve();
  },
});

// Initialize MMKV
export const storage = newStorage(
  new MMKV({
    id: "app-storage",
  })
);
