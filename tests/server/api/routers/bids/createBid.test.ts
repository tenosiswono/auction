import { type PrismaClient } from "@prisma/client";
import { type Session } from "next-auth";
import { describe, expect, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";

const mockUser: Session = {
  user: {
    id: "abc",
    email: "",
    image: "",
    deposit: 0,
  },
  expires: "",
};

describe("createBid", () => {
  const prismaMock = mockDeep<PrismaClient>();
  beforeEach(() => {
    vi.useFakeTimers();
    mockReset(prismaMock);
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  it("able to get create bid", async () => {
    const date = new Date(1680379656829);
    const endDate = new Date(1680379666829);
    vi.setSystemTime(date);
    prismaMock.auction.findFirst.mockResolvedValueOnce({
      id: "auctionId",
      title: "auctionId",
      image: "auctionId",
      startingPrice: 1000,
      currentPrice: 1000,
      duration: 1,
      startDate: date,
      endDate: endDate,
      createdAt: date,
      updatedAt: date,
      creatorId: "creator",
      status: "active",
      winnerId: null,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      bids: []
    });
    prismaMock.user.findFirst.mockResolvedValueOnce({
      id: "abc",
      email: "",
      image: "",
      deposit: 2000,
      name: "",
      emailVerified: null,
      password: "",
    });
    prismaMock.$transaction.mockResolvedValueOnce([
      {
        id: 'bid',
        amount: 1001,
        updatedAt: date
      },{},{},{
        _count: {
          bids: 0
        }
      }
    ]);
    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );

    const result = await caller.bid.createBid({
      amount: 1001,
      auctionId: "auctionId"
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "amount": 1001,
          "id": "bid",
          "updatedAt": 2023-04-01T20:07:36.829Z,
        },
        "success": true,
      }
    `)
  });
});
