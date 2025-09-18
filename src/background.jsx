chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "OPEN_TABS") {
    try {
      const tabs = Array.isArray(message.tabs) ? message.tabs.filter(t => t && t.url) : [];
      if (tabs.length === 0) {
        sendResponse && sendResponse({ ok: false, error: "NO_TABS" });
        return; 
      }

      const [first, ...rest] = tabs;
      chrome.windows.create({ url: first.url, focused: true }, (createdWindow) => {
        if (chrome.runtime.lastError || !createdWindow) {
          sendResponse && sendResponse({ ok: false, error: chrome.runtime.lastError?.message || "WINDOW_CREATE_FAILED" });
          return;
        }

        const windowId = createdWindow.id;
        rest.forEach((tab) => {
          try {
            chrome.tabs.create({ windowId, url: tab.url, pinned: !!tab.pinned });
          } catch (_) {}
        });

        sendResponse && sendResponse({ ok: true, windowId });
      });

      // Keep the message channel open for the async sendResponse
      return true;
    } catch (e) {
      sendResponse && sendResponse({ ok: false, error: e?.message || "UNKNOWN_ERROR" });
    }
  }

  if (message.type === "TABDEXAI_OPEN_CONNECT_TAB") {
    try {
      const targetUrl = message.url || "https://tab-dex-ai.vercel.app/extension";
      chrome.tabs.create({ url: targetUrl, active: true }, (tab) => {
        if (!tab || !tab.id) {
          sendResponse && sendResponse({ error: "TAB_CREATE_FAILED" });
          return;
        }

        const tabId = tab.id;
        const onUpdated = (updatedTabId, info) => {
          if (updatedTabId === tabId && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onUpdated);

            // Ask the content script in that tab to open the Phantom connect overlay
            chrome.tabs.sendMessage(tabId, { type: "TABDEXAI_CONNECT" }, (res) => {
              const lastErr = chrome.runtime.lastError;
              if (lastErr) {
                sendResponse && sendResponse({ error: lastErr.message || "NO_CONTENT_SCRIPT" });
                return;
              }
              // Persist address from content/inpage directly in the service worker
              const address = res && res.address;
              if (address) {
                try {
                  chrome.storage.local.set({ walletAddress: address }, () => {
                    // Notify any listeners (if popup is open somewhere)
                    chrome.runtime.sendMessage({ type: 'TABDEXAI_WALLET_CONNECTED', address });
                    // Open the extension's default popup (toolbar popup)
                    try {
                      chrome.action.openPopup(() => void 0);
                    } catch (_) {}
                  });
                } catch (_) {}
              }
              // Pass through result in case a sender is still listening
              sendResponse && sendResponse(res || {});
            });
          }
        };
        chrome.tabs.onUpdated.addListener(onUpdated);
      });
      return true; // keep channel open for async sendResponse
    } catch (e) {
      sendResponse && sendResponse({ error: e?.message || "UNKNOWN_ERROR" });
    }
  }
});