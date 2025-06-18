/* eslint-disable @typescript-eslint/no-explicit-any */
import { webcrypto as nodeCrypto } from 'crypto';
(globalThis as any).crypto = nodeCrypto;
import { TextEncoder, TextDecoder } from 'util';
(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;
import { JSDOM } from 'jsdom';
import {
  encodeNativeTextFragment,
  encodeDomFingerprint,
  encodeViewportOffset,
  decodeLocator,
  resolveLocator,
} from '../src/common';

describe('locator engine', () => {
  test('encodeNativeTextFragment', () => {
    const dom = new JSDOM('<p>Hello World</p>');
    const doc = dom.window.document;
    const range = doc.createRange();
    const text = doc.querySelector('p')!.firstChild!;
    range.setStart(text, 0);
    range.setEnd(text, 5);
    const frag = encodeNativeTextFragment(range)!;
    expect(frag).toBe('#:~:text=Hello');
    const decoded = decodeLocator(frag);
    expect(decoded).toEqual({ type: 'text', fragment: frag });
  });

  test('encodeDomFingerprint and resolve', async () => {
    const dom = new JSDOM('<div id="a">Sample Text Node</div>');
    const doc = dom.window.document;
    const el = doc.getElementById('a') as HTMLElement;
    const fp = await encodeDomFingerprint(el);
    const locator = decodeLocator(fp);
    expect(locator.type).toBe('fingerprint');
    const resolved = await resolveLocator(doc, locator);
    expect(resolved).toBe(el);
  });

  test('encodeDomFingerprint uses nth-of-type', async () => {
    const dom = new JSDOM('<div><p>first</p><p>second</p></div>');
    const doc = dom.window.document;
    const el = doc.querySelectorAll('p')[1] as HTMLElement;
    const fp = await encodeDomFingerprint(el);
    expect(fp).toMatch(/p:nth-of-type\(2\)/);
  });

  test('encodeViewportOffset', () => {
    const val = encodeViewportOffset(123.4);
    const loc = decodeLocator(val);
    expect(loc).toEqual({ type: 'offset', offset: 123 });
  });

  test('resolveLocator with text fragment', async () => {
    const dom = new JSDOM('<p>hello there world</p>');
    const doc = dom.window.document;
    const range = doc.createRange();
    const node = doc.querySelector('p')!.firstChild!;
    range.setStart(node, 6);
    range.setEnd(node, 11);
    const frag = encodeNativeTextFragment(range)!;
    const locator = decodeLocator(frag);
    const el = await resolveLocator(doc, locator);
    expect(el).toBe(doc.querySelector('p'));
  });

  test('sha256 fallback branch', async () => {
    const orig = (globalThis as any).crypto;
    delete (globalThis as any).crypto;
    const dom = new JSDOM('<div>test</div>');
    const el = dom.window.document.querySelector('div') as HTMLElement;
    const fp = await encodeDomFingerprint(el);
    expect(fp).toMatch(/body/);
    (globalThis as any).crypto = orig;
  });

  test('resolveLocator missing fingerprint', async () => {
    const dom = new JSDOM('<div id="x"></div>');
    const doc = dom.window.document;
    const locator = { type: 'fingerprint', path: 'body > div#nope', hash: 'h' } as const;
    const el = await resolveLocator(doc, locator, 200);
    expect(el).toBeNull();
  });

  test('resolveLocator offset', async () => {
    const dom = new JSDOM('<p>hi</p>');
    const doc = dom.window.document;
    const el = await resolveLocator(doc, { type: 'offset', offset: 10 });
    expect(el).toBe(doc.body);
  });

  test('resolveLocator text not found', async () => {
    const dom = new JSDOM('<p>hello world</p>');
    const doc = dom.window.document;
    const loc = { type: 'text', fragment: '#:~:text=missing' } as const;
    const el = await resolveLocator(doc, loc);
    expect(el).toBeNull();
  });
});
