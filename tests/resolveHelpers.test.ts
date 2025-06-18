/* eslint-disable @typescript-eslint/no-explicit-any */
import { webcrypto as nodeCrypto } from 'crypto';
(globalThis as any).crypto = nodeCrypto;
import { TextEncoder, TextDecoder } from 'util';
(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;
import {
  waitForYouTubeComments,
  waitForInfiniteScroll,
} from '../src/common';

describe('resolve helpers', () => {
  test('waitForYouTubeComments resolves element', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const promise = waitForYouTubeComments('c1', 200);
    setTimeout(() => {
      const el = document.createElement('div');
      el.id = 'c1';
      document.getElementById('root')!.appendChild(el);
    }, 50);
    const result = await promise;
    expect(result?.id).toBe('c1');
  });

  test('waitForInfiniteScroll finds text', async () => {
    document.body.innerHTML = '<div id="list"></div>';
    (globalThis as any).window.scrollBy = () => {};
    const promise = waitForInfiniteScroll('#list div', 'target', 200);
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = 'target text';
      document.getElementById('list')!.appendChild(el);
    }, 60);
    const result = await promise;
    expect(result?.textContent).toContain('target');
  });
});
