import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ca.truenorthpoints.app",
  appName: "TrueNorthPoints",
  webDir: "out",

  server: {
    // Load the deployed Vercel app inside the native WebView
    url: "https://pointsnorth.vercel.app",
    cleartext: false,
  },

  ios: {
    contentInset: "automatic",
    backgroundColor: "#ffffff",
    preferredContentMode: "mobile",
    scheme: "TrueNorthPoints",
  },
};

export default config;
