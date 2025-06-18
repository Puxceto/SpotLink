/** Options UI using Preact and CSS Modules */
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import styles from './options.module.css';

function Options() {
  const [maxPins, setMaxPins] = useState(50);
  const [color, setColor] = useState('#ffff00');

  useEffect(() => {
    chrome.storage.sync.get(['maxPins', 'highlightColor']).then((res) => {
      setMaxPins(res.maxPins ?? 50);
      setColor(res.highlightColor ?? '#ffff00');
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({ maxPins });
    chrome.storage.local.get('pins').then(({ pins = [] }) => {
      if (Array.isArray(pins) && pins.length > maxPins) {
        const trimmed = pins.slice(pins.length - maxPins);
        chrome.storage.local.set({ pins: trimmed });
      }
    });
  }, [maxPins]);

  useEffect(() => {
    chrome.storage.sync.set({ highlightColor: color });
  }, [color]);

  return (
    <div class={styles.container}>
      <div class={styles.row}>
        <label htmlFor="max">Max Pin History: {maxPins}</label>
        <input
          id="max"
          type="range"
          min="10"
          max="200"
          value={maxPins}
          onInput={(e) => setMaxPins(parseInt((e.target as HTMLInputElement).value))}
        />
      </div>
      <div class={styles.row}>
        <label htmlFor="color">Highlight Color</label>
        <input
          id="color"
          type="color"
          value={color}
          onInput={(e) => setColor((e.target as HTMLInputElement).value)}
        />
      </div>
    </div>
  );
}

render(<Options />, document.getElementById('app')!);
