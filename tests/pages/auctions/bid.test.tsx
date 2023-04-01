import { render, screen } from "@testing-library/react";
import Bid from "~/pages/auctions/bid";
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
    data: { user: { id: 10 }},
    status: "authenticated",
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
    render(<Bid />);
    expect(screen.getByTestId("mock-auction-list")).toBeInTheDocument();
  });
});
