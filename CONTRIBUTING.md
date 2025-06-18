# Contributing to SpotLink

Thank you for helping make SpotLink better! Please follow the guidelines below.

## Branch Strategy

All development happens on `main`. Stable releases are tagged from `main` once a stage is complete.

## Stages

| Stage | Purpose                          |
|------:|----------------------------------|
| 1     | Initial bootstrap                |
| 2     | Core functionality               |
| 3     | UI polish                        |
| 4     | Storage and options              |
| 5     | Build pipeline & release prep    |

## Running Tests

```bash
npm run lint
npm test
npm run e2e
```

## Commit Style

Keep commits focused and descriptive. Use the imperative mood, e.g. `Add options page`.
