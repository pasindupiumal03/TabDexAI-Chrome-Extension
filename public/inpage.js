(function () {
  try {
    if (window.__TABDEXAI_INPAGE_LOADED__) return;
    window.__TABDEXAI_INPAGE_LOADED__ = true;
  } catch (_) {}
  const getProvider = () => {
    try {
      if (typeof window !== "undefined" && window.solana && window.solana.isPhantom) {
        return window.solana;
      }
    } catch (_) {}
    return null;
  };

  const postResult = (payload) => {
    window.postMessage({ target: "TABDEXAI_EXTENSION", ...payload }, "*");
  };

  const removeOverlay = () => {
    const el = document.getElementById("tabdexai-connect-overlay");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  };

  const ensureOverlay = () => {};

  window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.target !== "TABDEXAI_INPAGE") return;

    // Auto-open overlay when explicitly asked (ensures user gesture on page)
    if (data.type === "TABDEXAI_PHANTOM_CONNECT") {
      const { requestId } = data;
      const provider = getProvider();
      if (!provider) {
        postResult({ type: "TABDEXAI_PHANTOM_CONNECTED", requestId, error: "PHANTOM_NOT_FOUND" });
        return;
      }
      try {
        const resp = await provider.connect({ onlyIfTrusted: false });
        const address = resp?.publicKey?.toString?.();
        postResult({ type: "TABDEXAI_PHANTOM_CONNECTED", requestId, address });
      } catch (e) {
        postResult({ type: "TABDEXAI_PHANTOM_CONNECTED", requestId, error: e?.message || "CONNECT_FAILED" });
      }
    }
  });
})();


