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

vi.mock("~/utils/uploadImg", () => ({
  uploadImg: vi.fn(() => ({ imageUrl: "image", error: null })),
}));

describe("createAuction", () => {
  const prismaMock = mockDeep<PrismaClient>();
  beforeEach(() => {
    vi.useFakeTimers();
    mockReset(prismaMock);
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  it("able to create auction", async () => {
    const date = new Date(2000, 1, 1, 13, 0, 0);
    const endDate = new Date(2000, 1, 1, 16, 0, 0);
    vi.setSystemTime(date);

    prismaMock.auction.create.mockResolvedValueOnce({
      id: "auctionId",
      title: "auctionId",
      image: "image",
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
    });

    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );

    const result = await caller.auction.createAuction({
      title: "auctionId",
      image: "auctionId",
      startingPrice: 1000,
      duration: 1,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "success": true,
      }
    `);
  });
});
