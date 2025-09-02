declare module "*.png" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

declare module "*.jpg" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

type KeyPair = {
  publicKey: string;
  privateKey: string;
};

type OnVeWorldConnectedResponse = {
  public_key: string;
  data: string;
  nonce: string;
};

type OnVeWorldConnectedData = {
  address: string;
  session: string;
};

type OnVeWorldConnectedError = {
  error_code: string;
  error_message: string;
};
