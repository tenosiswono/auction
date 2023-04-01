import { render, screen } from "@testing-library/react";
import Home from "~/pages/index";
import { describe, expect, vi } from "vitest";

vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    query: {},
    pathname: "/",
  }),
}));
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
  useSession: () => ({
    data: null,
    status: "loading",
    error: null,
  }),
}));

vi.mock("~/utils/api", () => ({
  api: {
    user: {
      getDepositBallance: {
        useQuery: vi.fn(() => ({ data: { deposit: 100 } })),
      },
    },
    deposit: {
      createDeposit: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
        })),
      },
    },
    auction: {
      getAuctions: {
        useQuery: vi.fn(() => ({ data: [] })),
      },
    },
  },
}));

// eslint-disable-next-line react/display-name
vi.mock("~/components/AuctionList", () => {
  return {
    default: () => <div data-testid="mock-auction-list" />,
  };
});

describe("Home", () => {
  it("renders the title and description", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", {
        name: /bee the highest bidder with/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /join the hive and become a top bidder\. discover a new world of exciting auctions/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText("How its Works")).toBeInTheDocument();
    expect(screen.getByTestId("mock-auction-list")).toBeInTheDocument();
  });
});
