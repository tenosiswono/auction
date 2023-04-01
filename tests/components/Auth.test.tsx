import { render, screen } from "@testing-library/react";
import Layout from "~/components/Auth";
import { describe, expect, vi, afterEach } from "vitest";

const mockPush = vi.fn()

vi.mock("next-auth/react");
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// eslint-disable-next-line react/display-name
vi.mock("~/components/Layout", () => {
  return {
    default: () => <div data-testid="mock-layout" />,
  };
});

describe("Auth component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it("renders loading", async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {},
      status: "loading",
      error: null,
    }));
    render(<Layout>Children</Layout>);
    expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
  })
  it("renders unauthenticated", async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {},
      status: "unauthenticated",
      error: null,
    }));
    render(<Layout>Children</Layout>);
    expect(mockPush).toHaveBeenCalledWith('/auth/signin');
  })
  it("renders authenticated", async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {},
      status: "authenticated",
      error: null,
    }));
    render(<Layout><div data-testid="children"></div></Layout>);
    expect(screen.getByTestId("children")).toBeInTheDocument();
  })
})