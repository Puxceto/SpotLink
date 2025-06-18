import { encodeNativeTextFragment } from '../src/common';

test('module exports function', () => {
  expect(typeof encodeNativeTextFragment).toBe('function');
});
