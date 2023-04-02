/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// mock pusher :( will add test if i have time
vi.mock("~/hooks/PusherProvider", () => ({
  usePusher: () => ({
    publicChannel: undefined,
    privateDepositChannel: undefined,
  }),
}));
vi.mock("~/utils/pusher", () => ({
  pusherServer: {
    trigger: vi.fn(),
  },
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
      })),
    },
  })),
}));
