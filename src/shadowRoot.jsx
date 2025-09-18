import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getBrowser } from "./utils/browser";

export const initPopup = async () => {
  const popup = document.createElement("div");
  popup.id = "react-chrome-extension-popup";
  popup.style.position = "fixed";
  popup.style.top = "16px";
  popup.style.right = "16px";
  popup.style.width = "384px";
  popup.style.height = "600px";
  popup.style.backgroundColor = "white";
  popup.style.zIndex = "999999";
  popup.style.boxShadow =
    "0px 8px 10px -6px rgba(0, 0, 0, 0.1), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)";
  popup.style.border = "1px solid #E4E6EA";
  popup.style.display = "flex";

  const shadowRoot = popup.attachShadow({ mode: "open" });
  const reactContainer = document.createElement("div");
  reactContainer.id = "react-target";
  shadowRoot.appendChild(reactContainer);

  // Load the built CSS file with Tailwind styles
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.href = getBrowser().runtime.getURL("shadow-root.css");
  shadowRoot.appendChild(linkElement);

  document.body.appendChild(popup);

  const root = createRoot(reactContainer);
  root.render(
      <App />
  );

  return { popup, shadowRoot, root };
};

