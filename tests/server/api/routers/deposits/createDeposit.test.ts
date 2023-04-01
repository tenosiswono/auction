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

describe("createDeposit", () => {
  const prismaMock = mockDeep<PrismaClient>();
  beforeEach(() => {
    vi.useFakeTimers();
    mockReset(prismaMock);
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("able to get create deposit", async () => {
    const date = new Date(1680379656829);
    vi.setSystemTime(date);
    prismaMock.user.findFirst.mockResolvedValueOnce({
      id: "dep",
      name: "dep",
      email: "dep@mail.com",
      emailVerified: null,
      image: "",
      password: "",
      deposit: 0,
    });
    prismaMock.$transaction.mockResolvedValueOnce([
      {
        id: "dep",
        name: "dep",
        email: "dep@mail.com",
        emailVerified: null,
        image: "",
        password: "",
        deposit: 1000,
      },
      {
        id: "dep1",
        status: "credit",
        userId: "dep",
        amount: 1000,
        createdAt: date,
        updatedAt: date,
      },
    ]);
    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );
    const result = await caller.deposit.createDeposit({
      amount: 1000,
    });
    
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "amount": 1000,
          "createdAt": 2023-04-01T20:07:36.829Z,
          "id": "dep1",
          "status": "credit",
          "updatedAt": 2023-04-01T20:07:36.829Z,
          "userId": "dep",
        },
        "success": true,
      }
    `);
  });
});
