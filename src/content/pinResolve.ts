import { decodeLocator, resolveLocator } from '../common';

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

async function highlight(el: HTMLElement) {
  const { highlightColor = '#ff0' } = await chrome.storage.sync.get('highlightColor');
  el.animate(
    [
      { boxShadow: `0 0 0 4px ${highlightColor}` },
      { boxShadow: '0 0 0 4px transparent' },
    ],
    { duration: 800 }
  );
}

async function observeAndResolve(locator: ReturnType<typeof decodeLocator>) {
  const found = await resolveLocator(document, locator);
  if (found) return found;
  return new Promise<HTMLElement | null>((resolve) => {
    const mo = new MutationObserver(async () => {
      const el = await resolveLocator(document, locator);
      if (el) {
        mo.disconnect();
        clearTimeout(tid);
        resolve(el);
      }
    });
    mo.observe(document, { subtree: true, childList: true });
    const tid = setTimeout(() => {
      mo.disconnect();
      resolve(null);
    }, 3000);
  });
}

const match = location.hash.match(/^#spot=(.+)$/);
if (!match) {
  console.log('SpotLink injected');
} else {
  const locatorStr = decodeURIComponent(match[1]);
  const locator = decodeLocator(locatorStr);
  const resolve = async () => {
    let el: HTMLElement | null = null;
    if (locator.type === 'offset') {
      window.scrollTo({ top: locator.offset, behavior: 'smooth' });
      el = document.body;
    } else {
      el = await observeAndResolve(locator);
      if (el && locator.type !== 'text') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    if (el) {
      await highlight(el);
    } else if (locator.type !== 'offset') {
      showToast('Spot not found');
    }
    history.replaceState(null, '', location.pathname + location.search);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resolve);
  } else {
    resolve();
  }
}
