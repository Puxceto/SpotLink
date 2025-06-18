# SpotLink

SpotLink is a Chrome-only extension that lets you drop a pin on any spot in any web page and share a `#spot=` URL. When opened by another SpotLink user, the page scrolls to and briefly highlights the spot.

This repository contains the Stage 1 bootstrap of the project. Running the dev build produces an unpacked extension that logs **"SpotLink injected"** when loaded on any page.

## Development

```bash
npm install
npm run dev
```

The build output appears in the `dist/` directory and can be loaded as an unpacked extension in Chrome.

## License

MIT
