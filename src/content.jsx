import { initPopup } from "./shadowRoot";

// Optionally mount injected UI
// setInterval(() => {
//   const popup = document.querySelector("#react-chrome-extension-popup");
//   if (popup) return;
//   initPopup();
// }, 100);

// Inject in-page script to access window.solana (content scripts are isolated)
const injectInpageScript = () => {
  try {
    console.log("INPAGE ==> ")
    const container = document.documentElement || document.head;
    if (!container) return;

    // Avoid duplicate injection
    if (document.getElementById("tabdexai-inpage-script")) return;

    const script = document.createElement("script");
    script.id = "tabdexai-inpage-script";
    script.type = "text/javascript";
    script.src = chrome.runtime.getURL("inpage.js");
    script.async = false;
    container.appendChild(script);

    script.addEventListener("load", () => {
      // keep script node to avoid re-inject loops; no removal
      window.postMessage({ type: "TABDEXAI_INPAGE_READY", target: "TABDEXAI_EXTENSION" }, "*");
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("TabDexAI: failed to inject inpage script", e);
  }
};

// Wait for DOM readiness before injection (some pages have a null head early)
if (document.readyState === "complete" || document.readyState === "interactive") {
  console.log("READYYYYYY")
  injectInpageScript();
} else {
  window.addEventListener("DOMContentLoaded", injectInpageScript, { once: true });
}

// Maintain pending connect requests keyed by requestId
const pendingConnectResponses = new Map();

// Receive messages from the in-page context
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.target !== "TABDEXAI_EXTENSION") return;

  if (data.type === "TABDEXAI_PHANTOM_CONNECTED") {
    const { requestId, address, error } = data;
    const resolver = pendingConnectResponses.get(requestId);
    if (resolver) {
      resolver({ address, error });
      pendingConnectResponses.delete(requestId);
    }
  }
});

// Listen for messages from the extension (popup/background)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  if (message.type === "TABDEXAI_PING") {
    try {
      sendResponse({ ok: true });
    } catch (_) {}
    return; // no async work
  }

  if (message.type === "TABDEXAI_CONNECT") {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // Store resolver to reply asynchronously
    pendingConnectResponses.set(requestId, (payload) => {
      try {
        sendResponse(payload);
      } catch (_) {
        // channel might be closed; ignore
      }
    });

    // Directly ask in-page to initiate Phantom connect
    window.postMessage(
      { type: "TABDEXAI_PHANTOM_CONNECT", target: "TABDEXAI_INPAGE", requestId },
      "*"
    );

    // keep the message channel open for async response
    return true;
  }
});
