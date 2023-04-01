import { describe, expect, vi } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AuctionItem from "~/components/AuctionItem/AuctionItem";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";

const mutateAsync = vi.fn();
const mockPush = vi.fn();

vi.mock("next-auth/react");
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
vi.mock("~/utils/api", () => ({
  api: {
    auction: {
      onAuctionChange: {
        useSubscription: vi.fn(),
      },
      publishAuction: {
        useMutation: vi.fn(() => ({
          mutateAsync,
        })),
      },
    },
    bid: {
      createBid: {
        useMutation: vi.fn(() => ({
          mutateAsync,
        })),
      },
    },
  },
}));

describe("AuctionItem component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  //TODO: render draft user own
  it("render draft user own", async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementation(() => ({
      data: {
        user: {
          name: "draft-user",
          id: "clfv7grtb0000ytmi7z7pd64q",
        },
      },
      status: "authenticated",
      error: null,
    }));
    const mockedData: GetAuctionResponse = {
      id: "clfwa3rem0001yt9gtid999ji",
      title: "draft-title",
      image: "https://placehold.co/400",
      startingPrice: 10001,
      currentPrice: 10001,
      duration: 1,
      startDate: null,
      endDate: null,
      createdAt: new Date("2023-03-31T08:24:30.334Z"),
      updatedAt: new Date("2023-03-31T08:24:30.334Z"),
      creatorId: "clfv7grtb0000ytmi7z7pd64q",
      status: "draft",
      winnerId: null,
      bids: [],
      winner: null,
      creator: {
        name: "draft-user",
        id: "clfv7grtb0000ytmi7z7pd64q",
      },
      _count: {
        bids: 0,
      },
    };
    render(<AuctionItem data={mockedData} />);
    expect(screen.queryByText(/draft-title/)).toBeInTheDocument();
    expect(screen.queryByText(/[$]10001/)).toBeInTheDocument();
    expect(screen.getByTestId("auction-status")).toHaveTextContent("draft");
    expect(screen.queryByTestId("bid-button-timer")).not.toBeInTheDocument();
    expect(screen.getByTestId("btn-publish")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("btn-publish"))
    expect(screen.getByTestId("btn-publish")).toBeInTheDocument();
    expect(mutateAsync).toHaveBeenLastCalledWith({
      id: "clfwa3rem0001yt9gtid999ji",
    });
  });
  it('render active non login', async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: null,
      status: "unauthenticated",
      error: null,
    }));
    const mockedData: GetAuctionResponse = {
      id: "clfwa3rem0001yt9gtid999ji",
      title: "active-title",
      image: "https://placehold.co/400",
      startingPrice: 10001,
      currentPrice: 10001,
      duration: 1,
      startDate: null,
      endDate: null,
      createdAt: new Date("2023-03-31T08:24:30.334Z"),
      updatedAt: new Date("2023-03-31T08:24:30.334Z"),
      creatorId: "clfv7grtb0000ytmi7z7pd64q",
      status: "active",
      winnerId: null,
      bids: [],
      winner: null,
      creator: {
        name: "draft-user",
        id: "clfv7grtb0000ytmi7z7pd64q",
      },
      _count: {
        bids: 0,
      },
    };
    render(<AuctionItem data={mockedData} />);
    expect(screen.queryByText(/active-title/)).toBeInTheDocument();
    expect(screen.queryByText(/[$]10001/)).toBeInTheDocument();
    expect(screen.getByTestId("auction-status")).toHaveTextContent("active");
    expect(screen.queryByTestId("bid-button-timer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("btn-publish")).not.toBeInTheDocument();
  })
  it('render active user non own', async () => {
    const date = new Date(2000, 1, 1, 13, 0, 0)
    const endDate = new Date(2000, 1, 1, 13, 1, 0)
    vi.setSystemTime(date)
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {
        user: {
          name: "viewer-user",
          id: "clfv7grtb0000ytmi7z7pd780",
        }
      },
      status: "authenticated",
      error: null,
    }));
    const mockedData: GetAuctionResponse = {
      id: "clfwa3rem0001yt9gtid999ji",
      title: "active-title",
      image: "https://placehold.co/400",
      startingPrice: 10001,
      currentPrice: 10001,
      duration: 1,
      startDate: date,
      endDate: endDate,
      createdAt: date,
      updatedAt: date,
      creatorId: "clfv7grtb0000ytmi7z7pd64q",
      status: "active",
      winnerId: null,
      bids: [],
      winner: null,
      creator: {
        name: "creator-user",
        id: "clfv7grtb0000ytmi7z7pd64q",
      },
      _count: {
        bids: 0,
      },
    };

    render(<AuctionItem data={mockedData} />);
    expect(screen.queryByText(/active-title/)).toBeInTheDocument();
    expect(screen.queryByText(/[$]10001/)).toBeInTheDocument();
    expect(screen.getByTestId("auction-status")).toHaveTextContent("active");
    expect(screen.queryByTestId("bid-button-timer")).toBeInTheDocument();
    expect(screen.queryByTestId("btn-publish")).not.toBeInTheDocument();
  })
  it('render active outbid', async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {
        user: {
          name: "outbid-user",
          id: "clfv7grtb0000ytmi7z7bidder",
        }
      },
      status: "authenticated",
      error: null,
    }));
    const mockedData: GetAuctionResponse = {
      id: "clfwa3rem0001yt9gtid999ji",
      title: "outbid-title",
      image: "https://placehold.co/400",
      startingPrice: 10001,
      currentPrice: 10001,
      duration: 1,
      startDate: null,
      endDate: null,
      createdAt: new Date("2023-03-31T08:24:30.334Z"),
      updatedAt: new Date("2023-03-31T08:24:30.334Z"),
      creatorId: "clfv7grtb0000ytmi7z7pd64q",
      status: "active",
      winnerId: null,
      bids: [{
        updatedAt: new Date("2023-03-31T08:24:30.334Z"),
        amount: 10001,
        bidderId: 'clfv7grtb0000ytmi7z7bidder',
        id: 'idbidclfv7grtb0000ytmi7z7bidder',
      }],
      winner: null,
      creator: {
        name: "draft-user",
        id: "clfv7grtb0000ytmi7z7pd64q",
      },
      _count: {
        bids: 0,
      },
    };

    render(<AuctionItem data={mockedData} />);
    expect(screen.queryByText(/outbid-title/)).toBeInTheDocument();
    expect(screen.getByTestId("auction-status")).toHaveTextContent("Outbid!");
  })
  it('render active outbidded', async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {
        user: {
          name: "outbidded-user",
          id: "clfv7grtb0000ytmi7z7bidder",
        }
      },
      status: "authenticated",
      error: null,
    }));
    const mockedData: GetAuctionResponse = {
      id: "clfwa3rem0001yt9gtid999ji",
      title: "outbidded-title",
      image: "https://placehold.co/400",
      startingPrice: 10001,
      currentPrice: 10001,
      duration: 1,
      startDate: null,
      endDate: null,
      createdAt: new Date("2023-03-31T08:24:30.334Z"),
      updatedAt: new Date("2023-03-31T08:24:30.334Z"),
      creatorId: "clfv7grtb0000ytmi7z7pd64q",
      status: "draft",
      winnerId: null,
      bids: [{
        updatedAt: new Date("2023-03-31T08:24:30.334Z"),
        amount: 900,
        bidderId: 'clfv7grtb0000ytmi7z7bidder',
        id: 'idbidclfv7grtb0000ytmi7z7bidder',
      }],
      winner: null,
      creator: {
        name: "draft-user",
        id: "clfv7grtb0000ytmi7z7pd64q",
      },
      _count: {
        bids: 0,
      },
    };
    render(<AuctionItem data={mockedData} />);
    expect(screen.queryByText(/outbidded-title/)).toBeInTheDocument();
    expect(screen.getByTestId("auction-status")).toHaveTextContent("Outbidded!");
  })
  it('render active user own', async () => {
    const date = new Date(2000, 1, 1, 13, 0, 0)
    const endDate = new Date(2000, 1, 1, 13, 1, 0)
    vi.setSystemTime(date)
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {
        user: {
          name: "creator-user",
          id: "clfv7grtb0000ytmi7z7pd64q",
        }
      },
      status: "authenticated",
      error: null,
    }));
    const mockedData: GetAuctionResponse = {
      id: "clfwa3rem0001yt9gtid999ji",
      title: "active-title",
      image: "https://placehold.co/400",
      startingPrice: 10001,
      currentPrice: 10001,
      duration: 1,
      startDate: date,
      endDate: endDate,
      createdAt: date,
      updatedAt: date,
      creatorId: "clfv7grtb0000ytmi7z7pd64q",
      status: "active",
      winnerId: null,
      bids: [],
      winner: null,
      creator: {
        name: "creator-user",
        id: "clfv7grtb0000ytmi7z7pd64q",
      },
      _count: {
        bids: 0,
      },
    };
    render(<AuctionItem data={mockedData} />);
    expect(screen.queryByText(/active-title/)).toBeInTheDocument();
    expect(screen.getByTestId("auction-status")).toHaveTextContent("active");
    expect(screen.queryByTestId("bid-button-timer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("btn-publish")).not.toBeInTheDocument();
  })
  it('render completed with winner', async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {
        user: {
          name: "winner-user",
          id: "clfv7grtb0000ytmi7z7pdwin",
        }
      },
      status: "authenticated",
      error: null,
    }));
    const mockedData: GetAuctionResponse = {
      id: "clfwa3rem0001yt9gtid999ji",
      title: "completed-title",
      image: "https://placehold.co/400",
      startingPrice: 10001,
      currentPrice: 10001,
      duration: 1,
      startDate: null,
      endDate: null,
      createdAt: new Date("2023-03-31T08:24:30.334Z"),
      updatedAt: new Date("2023-03-31T08:24:30.334Z"),
      creatorId: "clfv7grtb0000ytmi7z7pd64q",
      status: "completed",
      winnerId: "clfv7grtb0000ytmi7z7pdwin",
      bids: [{
        updatedAt: new Date("2023-03-31T08:24:30.334Z"),
        amount: 10001,
        bidderId: 'clfv7grtb0000ytmi7z7pdwin',
        id: 'clfv7grtb0000ytmi7z7pdwin',
      }],
      winner: {
        id: 'clfv7grtb0000ytmi7z7pdwin',
        name: 'winner-user'
      },
      creator: {
        name: "creator-user",
        id: "clfv7grtb0000ytmi7z7pd64q",
      },
      _count: {
        bids: 0,
      },
    };
    render(<AuctionItem data={mockedData} />);
    expect(screen.queryByText(/completed-title/)).toBeInTheDocument();
    expect(screen.getByTestId("auction-status")).toHaveTextContent("Winner!");
    expect(screen.queryByText(/winner-user/)).toBeInTheDocument();
  })
  it('render completed without winner', async () => {
    const mockNextAuth = await import("next-auth/react");
    mockNextAuth.useSession = vi.fn().mockImplementationOnce(() => ({
      data: {
        user: {
          name: "completed-user",
          id: "clfv7grtb0000ytmi7z7pd64q",
        }
      },
      status: "authenticated",
      error: null,
    }));
    const mockedData: GetAuctionResponse = {
      id: "clfwa3rem0001yt9gtid999ji",
      title: "completed-title",
      image: "https://placehold.co/400",
      startingPrice: 10001,
      currentPrice: 10001,
      duration: 1,
      startDate: null,
      endDate: null,
      createdAt: new Date("2023-03-31T08:24:30.334Z"),
      updatedAt: new Date("2023-03-31T08:24:30.334Z"),
      creatorId: "clfv7grtb0000ytmi7z7pd64q",
      status: "completed",
      winnerId: null,
      bids: [],
      winner: null,
      creator: {
        name: "draft-user",
        id: "clfv7grtb0000ytmi7z7pd64q",
      },
      _count: {
        bids: 0,
      },
    };
    render(<AuctionItem data={mockedData} />);
    expect(screen.queryByText(/completed-title/)).toBeInTheDocument();
    expect(screen.getByTestId("auction-status")).toHaveTextContent("completed");
    expect(screen.queryByText("-")).toBeInTheDocument();
  })
});
