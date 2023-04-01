/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true
expect.extend(matchers);

afterEach(() => {
  cleanup();
});