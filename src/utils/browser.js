export const getBrowser = () => {
  if (typeof chrome !== "undefined" && typeof chrome.storage !== "undefined") {
    return chrome;
  } else if (
    typeof browser !== "undefined" &&
    typeof browser.storage !== "undefined"
  ) {
    return browser;
  } else {
    throw new Error("Browser API is not available");
  }
};

export const isFirefox = () => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Firefox")) return true;
  return false;
};
