/** Popup UI using Preact and CSS Modules */
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import styles from './popup.module.css';

type Pin = { url: string; locator: string; created: number; title?: string };

function relativeAge(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day ago`;
}

function Popup() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [filter, setFilter] = useState('');

  const load = async () => {
    const { pins = [] } = await chrome.storage.local.get('pins');
    const list = Array.isArray(pins) ? (pins as Pin[]) : [];
    setPins(list.slice(-20).reverse());
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = pins.filter((p) => {
    const u = new URL(p.url);
    const t = p.title || u.hostname;
    const q = filter.toLowerCase();
    return t.toLowerCase().includes(q) || u.hostname.toLowerCase().includes(q);
  });

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
  };

  const remove = async (pin: Pin) => {
    const { pins = [] } = await chrome.storage.local.get('pins');
    const list = (pins as Pin[]).filter((p) => p.created !== pin.created);
    await chrome.storage.local.set({ pins: list });
    load();
  };

  return (
    <div class={styles.container}>
      <input
        class={styles.search}
        placeholder="Search"
        value={filter}
        onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
      />
      <ul class={styles.list}>
        {filtered.map((p) => (
          <li class={styles.item} key={p.created}>
            <img
              src={`chrome://favicon/size/16/${new URL(p.url).origin}`}
              width="16"
              height="16"
            />
            <span class={styles.title} title={p.title}>{p.title?.slice(0, 50)}</span>
            <span>{relativeAge(p.created)}</span>
            <span class={styles.buttons}>
              <button onClick={() => copy(p.url)}>Copy</button>
              <button onClick={() => remove(p)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

render(<Popup />, document.getElementById('app')!);
