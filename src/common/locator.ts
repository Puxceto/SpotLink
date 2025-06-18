export type Locator =
  | { type: 'text'; fragment: string }
  | { type: 'fingerprint'; path: string; hash: string }
  | { type: 'offset'; offset: number };

function base64UrlFromBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sha256Base64Url(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const cryptoMod: (typeof import('crypto')) | null = globalThis.crypto?.subtle
    ? null
    : await import('crypto');
  const subtle: SubtleCrypto = (
    globalThis.crypto?.subtle ?? cryptoMod!.webcrypto.subtle
  ) as SubtleCrypto;
  const hash = await subtle.digest("SHA-256", data);
  return base64UrlFromBuffer(hash);
}

function cssPath(node: Element): string {
  const doc = node.ownerDocument;
  const parts: string[] = [];
  let el: Element | null = node;
  while (el && el !== doc.body) {
    let part = el.nodeName.toLowerCase();
    if ((el as HTMLElement).id) part += `#${(el as HTMLElement).id}`;
    parts.unshift(part);
    el = el.parentElement;
  }
  parts.unshift("body");
  return parts.join(" > ");
}
export function encodeNativeTextFragment(range: Range): string | null {
  const text = range.toString().replace(/\s+/g, ' ').trim();
  if (!text) return null;
  return `#:~:text=${encodeURIComponent(text)}`;
}

export async function encodeDomFingerprint(node: HTMLElement): Promise<string> {
  const path = cssPath(node);
  const text = node.textContent?.replace(/\s+/g, ' ').trim().slice(0, 40) || '';
  const hash = await sha256Base64Url(text);
  return `${path}|${hash}`;
}

export function encodeViewportOffset(y: number): string {
  return `offset:${Math.round(y)}`;
}

export function decodeLocator(str: string): Locator {
  if (str.startsWith('#:~:text=')) {
    return { type: 'text', fragment: str };
  }
  if (str.startsWith('offset:')) {
    return { type: 'offset', offset: parseInt(str.slice(7), 10) };
  }
  const [path, hash] = str.split('|');
  return { type: 'fingerprint', path, hash };
}

export async function resolveLocator(
  doc: Document,
  locator: Locator,
  timeoutMs = 2000
): Promise<HTMLElement | null> {
  if (locator.type === 'fingerprint') {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const el = doc.querySelector<HTMLElement>(locator.path);
      if (el) {
        const fp = await encodeDomFingerprint(el);
        if (fp === `${locator.path}|${locator.hash}`) return el;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    return null;
  }

  if (locator.type === 'text') {
    const target = decodeURIComponent(locator.fragment.replace('#:~:text=', ''));
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(target)) {
        return node.parentElement as HTMLElement;
      }
    }
    return null;
  }

  return doc.body;
}
