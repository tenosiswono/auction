import { type PrismaClient } from "@prisma/client";
import { type Session } from "next-auth";
import { describe, expect } from "vitest";
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

describe("createUser", () => {
  const prismaMock = mockDeep<PrismaClient>();
  beforeEach(() => {
    mockReset(prismaMock);
  });
  it("success create use", async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      id: "new",
      name: "new",
      email: "new@mail.com",
      emailVerified: null,
      image: "",
      password: "",
      deposit: 0,
    });
    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );

    const result = await caller.user.createUser({
      email: "new@mail.com",
      password: "1234567890",
      name: "new",
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "deposit": 0,
          "email": "new@mail.com",
          "emailVerified": null,
          "id": "new",
          "image": "",
          "name": "new",
        },
        "success": true,
      }
    `);
  });
  it("Failed create zod errors email", async () => {
    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );
    const createUserAsync = async () =>
      await caller.user.createUser({
        email: "",
        password: "",
        name: "",
      });
    await expect(createUserAsync()).rejects.toMatchInlineSnapshot(`
      [TRPCError: [
        {
          "path": [
            "email"
          ],
          "message": "Email should be provided\\"",
          "code": "custom"
        }
      ]]
    `);
  });
  it("Failed create zod errors password", async () => {
    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );
    const createUserAsync = async () =>
      await caller.user.createUser({
        email: "mail@mail.com",
        password: "",
        name: "",
      });
    await expect(createUserAsync()).rejects.toMatchInlineSnapshot(`
      [TRPCError: [
        {
          "path": [
            "password"
          ],
          "message": "Password should be provided",
          "code": "custom"
        }
      ]]
    `);
  });
  it("Failed create email duplicate", async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce({
      id: "exist",
      name: "exist",
      email: "exist@mail.com",
      emailVerified: null,
      image: "",
      password: "",
      deposit: 0,
    });
    const caller = appRouter.createCaller(
      createInnerTRPCContext({ session: mockUser, prisma: prismaMock })
    );
    const createUserAsync = async () =>
      await caller.user.createUser({
        email: "exist@mail.com",
        password: "password",
        name: "exist",
      });
    await expect(createUserAsync()).rejects.toMatchInlineSnapshot(`
      [TRPCError: [
        {
          "path": [
            "email"
          ],
          "message": "Email already registered",
          "code": "custom"
        }
      ]]
    `)
  });
});
