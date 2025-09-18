// Detect Phantom
export const getProvider = () => {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider?.isPhantom) {
      return provider;
    }
  }
  return null;
};

// Connect Phantom Wallet
export const connectWallet = async () => {
  try {
    const provider = getProvider();
    if (!provider) {
      alert("Phantom wallet not found! Please install the Phantom extension.");
      return null;
    }

    const resp = await provider.connect(); // opens Phantom popup
    console.log("Wallet connected:", resp.publicKey.toString());
    return resp.publicKey.toString();
  } catch (err) {
    console.error("Wallet connection error:", err);
    return null;
  }
};

// Disconnect Wallet
export const disconnectWallet = async () => {
  try {
    const provider = getProvider();
    if (provider) {
      await provider.disconnect();
      console.log("Wallet disconnected");
    }
  } catch (err) {
    console.error("Wallet disconnect error:", err);
  }
};