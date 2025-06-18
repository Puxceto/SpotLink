import {
  encodeNativeTextFragment,
  encodeDomFingerprint,
  encodeViewportOffset,
} from '../common';

type Pin = { url: string; locator: string; created: number; title: string };

async function pushPin(pin: Pin) {
  const { pins = [] } = await chrome.storage.local.get('pins');
  const list = Array.isArray(pins) ? pins : [];
  const { maxPins = 50 } = await chrome.storage.sync.get('maxPins');
  list.push(pin);
  if (list.length > maxPins) {
    list.splice(0, list.length - maxPins);
  }
  await chrome.storage.local.set({ pins: list });
}

function showToast(msg: string) {
  const div = document.createElement('div');
  div.textContent = msg;
  Object.assign(div.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#333',
    color: '#fff',
    padding: '8px',
    borderRadius: '4px',
    zIndex: '2147483647',
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

async function generateLocator(): Promise<string> {
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed) {
    const frag = encodeNativeTextFragment(sel.getRangeAt(0));
    if (frag) return frag;
  }
  const el = document.elementFromPoint(
    window.innerWidth / 2,
    window.innerHeight / 2
  ) as HTMLElement | null;
  if (el) {
    return await encodeDomFingerprint(el);
  }
  return encodeViewportOffset(window.scrollY);
}

async function getCurrentTabTitle(): Promise<string> {
  try {
    const resp = await chrome.runtime.sendMessage('getTabTitle');
    return resp?.title ?? document.title;
  } catch {
    return document.title;
  }
}

export async function createPin() {
  const locator = await generateLocator();
  const url = `${location.origin}${location.pathname}#spot=${encodeURIComponent(
    locator
  )}`;
  await navigator.clipboard.writeText(url);
  const title = await getCurrentTabTitle();
  await pushPin({ url, locator, created: Date.now(), title });
  showToast('SpotLink copied!');
}

function handleKey(e: KeyboardEvent) {
  if (e.altKey && e.key.toLowerCase() === 'p') {
    createPin();
  }
}

document.addEventListener('keydown', handleKey);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg === 'createPin') createPin();
});
