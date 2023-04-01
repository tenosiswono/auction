import { act, fireEvent, render, screen } from "@testing-library/react";
import Layout from "~/components/Layout";
import { describe, expect, vi } from "vitest";

vi.mock("next-auth/react");
vi.mock("next/router", () => ({
  useRouter: () => ({
    pathname: '/',
  }),
}));

vi.mock("~/utils/api", () => ({
  api: {
    user: {
      getDepositBallance: {
        useQuery: vi.fn(() => ({ data: { deposit: 100 } })),
      },
      onDepositChange: {
        useSubscription: vi.fn(),
      },
    },
    deposit: {
      createDeposit: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
        })),
      },
    },
  },
}));

describe("Layout component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the logo and sidebar", async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {},
      status: "loading",
      error: null,
    }));
    render(<Layout>Children</Layout>);
    expect(screen.getByAltText("AuctionHive")).toBeInTheDocument();
    expect(screen.getByLabelText("Sidebar")).toBeInTheDocument();
  });


  it("renders the menu items and a logout button", async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {
        user: { name: "John" },
        expires: "2023-04-01T12:00:00.000Z",
      },
      status: "authenticated",
      error: null,
    }));
    render(<Layout>Children</Layout>);
    expect(screen.getByText("Auctions")).toBeInTheDocument();
    expect(screen.getByText("Bidded Auctions")).toBeInTheDocument();
    expect(screen.getByText("My Auctions")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Start a new auction" })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {
      name: /signout/i,
      hidden: true
    })).toBeInTheDocument();
  });

  it("signs out the user when the logout button is clicked", async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {
        user: { name: "John" },
        expires: "2023-04-01T12:00:00.000Z",
      },
      status: "authenticated",
      error: null,
    }));
    mockNextAuth.signOut = vi.fn()
    render(<Layout>Children</Layout>);
    const logoutButton = screen.getByRole('button', {
      name: /signout/i,
      hidden: true
    });
    act(() => {
      fireEvent.click(logoutButton);
    })
    expect(mockNextAuth.signOut).toHaveBeenCalled();
  });

  it("renders the signup and signin buttons", async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {},
      status: "loading",
      error: null,
    }));
    render(<Layout>Children</Layout>);
    expect(screen.getByRole("link", { name: "Signup" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Signin" })).toBeInTheDocument();
  });
});
