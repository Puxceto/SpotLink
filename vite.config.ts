import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import preact from '@preact/preset-vite';
import manifest from './public/manifest.json' assert { type: 'json' };

export default defineConfig({
  plugins: [preact(), crx({ manifest })],
});
