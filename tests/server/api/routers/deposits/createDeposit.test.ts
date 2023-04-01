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
    const date = new Date(2000, 1, 1, 13, 0, 0);
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
          "createdAt": 2000-02-01T06:00:00.000Z,
          "id": "dep1",
          "status": "credit",
          "updatedAt": 2000-02-01T06:00:00.000Z,
          "userId": "dep",
        },
        "success": true,
      }
    `);
  });
});
