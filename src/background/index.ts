async function updateBadge() {
  const { pins = [] } = await chrome.storage.local.get('pins');
  const count = Array.isArray(pins) ? pins.length : 0;
  await chrome.action.setBadgeText({ text: count ? String(count) : '' });
  const color = count >= 45 ? '#ff0000' : '#0000ff';
  await chrome.action.setBadgeBackgroundColor({ color });
}

chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
  chrome.contextMenus.create({
    id: 'create-spotlink',
    title: 'Create SpotLink',
    contexts: ['page', 'selection'],
  });
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pins) updateBadge();
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, 'createPin').catch(() => {
      /* ignore */
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'create-spotlink' && tab?.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, 'createPin').catch(() => {
      /* ignore */
    });
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg === 'getTabTitle') {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      sendResponse({ title: tabs[0]?.title ?? '' });
    });
    return true;
  }
});
