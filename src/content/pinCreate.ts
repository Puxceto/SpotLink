import {
  encodeNativeTextFragment,
  encodeDomFingerprint,
  encodeViewportOffset,
} from '../common';

type Pin = { url: string; locator: string; created: number };

async function pushPin(pin: Pin) {
  const { pins = [] } = await chrome.storage.local.get('pins');
  const list = Array.isArray(pins) ? pins : [];
  list.push(pin);
  if (list.length > 50) {
    list.splice(0, list.length - 50);
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

export async function createPin() {
  const locator = await generateLocator();
  const url = `${location.origin}${location.pathname}#spot=${encodeURIComponent(
    locator
  )}`;
  await navigator.clipboard.writeText(url);
  await pushPin({ url, locator, created: Date.now() });
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
