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

describe("createAuction",  () => {
  const prismaMock = mockDeep<PrismaClient>();
  beforeEach(() => {
    vi.useFakeTimers();
    mockReset(prismaMock);
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  it('able to get auctions empty', async () => {
    prismaMock.auction.findMany.mockResolvedValueOnce([])
    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );
  
    const result = await caller.auction.getAuctions({});
    
    expect(result).toMatchInlineSnapshot(`
      {
        "data": [],
        "nextCursor": undefined,
        "success": true,
      }
    `)
  })
});
