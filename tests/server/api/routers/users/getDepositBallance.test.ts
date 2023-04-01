import { type PrismaClient, type User } from "@prisma/client";
import { type Session } from "next-auth";
import { describe, expect } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";

describe("getDepositBallance",  () => {
  it('able to get deposit ballance', async () => {
    const prismaMock = mockDeep<PrismaClient>();
    const mockOutput: User = {
      id: "abc",
      deposit: 1000,
      name: null,
      email: null,
      emailVerified: null,
      image: null,
      password: "",
    };
  
    const mockUser: Session = {
      user: {
        id: "abc",
        email: "",
        image: "",
        deposit: 0,
      },
      expires: "",
    };
  
    prismaMock.user.findFirst.mockResolvedValueOnce(mockOutput);
    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );
  
    const result = await caller.user.getDepositBallance();
  
    expect(result).toStrictEqual({
      deposit: 1000,
      id: "abc",
      success: true,
    });
  })
});
