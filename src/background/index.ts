// SlopScan Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SlopScan] Extension installed and background service worker initialized.');
});

// Clean up inspection overlays when tabs update or close
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.tabs.sendMessage(tabId, { type: 'CLEAR_INSPECTION' }).catch(() => {
      // Ignored if content script isn't loaded
    });
  }
});

