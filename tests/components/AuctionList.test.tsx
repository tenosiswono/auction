import { Mock, describe, expect, vi } from "vitest";
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { mockAllIsIntersecting } from "react-intersection-observer/test-utils";
import AuctionList from "~/components/AuctionList";

const mutateAsync = vi.fn();
const mockUseInfiniteQuery = {
  data: {
    pages: [{
      nextCursor: 'next',
      data: [{
        id: '1'
      }, {
        id: '2'
      }, {
        id: '3'
      }]
    }]
  },
  isLoading: false,
  fetchNextPage: vi.fn(),
  isFetchingNextPage: false,
  hasNextPage: true,
};

vi.mock("next-auth/react", () => ({
  data: {
    user: {
      name: "viewer-user",
      id: "clfv7grtb0000ytmi7z7pd780",
    },
  },
  status: "authenticated",
  error: null,
}));

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: "active",
  }),
}));
vi.mock("~/utils/api", () => ({
  api: {
    auction: {
      getAuctions: {
        useInfiniteQuery: vi.fn(() => ({
          data: null,
          isLoading: true,
          fetchNextPage: vi.fn(),
          isFetchingNextPage: false,
          hasNextPage: true,
        })),
      },
      getMyAuctions: {
        useInfiniteQuery: vi.fn(() => ({
          data: {
            data: []
          },
          isLoading: false,
          fetchNextPage: vi.fn(),
          isFetchingNextPage: false,
          hasNextPage: true,
        })),
      },
      getBidAuctions: {
        useInfiniteQuery:  vi.fn(() => (mockUseInfiniteQuery)),
      },
    },
  },
}));

// eslint-disable-next-line react/display-name
vi.mock("~/components/AuctionItem/AuctionItem", () => {
  return {
    default: () => <div data-testid="mock-auction-item" />,
  };
});
describe("AuctionList component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  //empty

  it("render loader", () => {
    mockAllIsIntersecting(false);
    render(<AuctionList page={"index"} title={""} />);
    expect(screen.queryAllByTestId("auciton-loader")).toHaveLength(3);
  });
  it("render empty",  () => {
    render(<AuctionList page={"me"} title={""} />);
    expect(screen.queryByTestId("empty-state")).toBeInTheDocument();
  });
  it("render empty",  () => {
    render(<AuctionList page={"bid"} title={""} />);
    expect(screen.queryAllByTestId("mock-auction-item")).toHaveLength(3);
    mockAllIsIntersecting(true);
    expect(mockUseInfiniteQuery.fetchNextPage).toHaveBeenCalledOnce()
    mockAllIsIntersecting(false);
  });
});
