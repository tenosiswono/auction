import bcrypt from "bcrypt";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  updateUser: protectedProcedure
    .input(
      z
        .object({
          // username: z.string(),
          name: z.string().trim().min(3).nullish(),
          bio: z.string().nullish(),
          website: z.string().nullish(),
          bgImage: z.string().nullish(),
          profileImage: z.string().nullish(),
        })
        .refine((obj) => {
          if (
            Object.values(obj).some((val) => val === null && val === undefined)
          ) {
            throw new Error("At least one value has to be defined");
          }
          return true;
        })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...input,
        },
      });
      return { success: true, user };
    }),
  createUser: publicProcedure
    .input(
      z
        .object({
          name: z.string().trim().min(3).nullish(),
          password: z.string().nullish(),
          email: z.string().nullish(),
        })
        .refine((data) => {
          if (!data.email) {
            throw new z.ZodError([
              {
                path: ["email"],
                message: 'Email should be provided"',
                code: "custom",
              },
            ]);
          }
          if (!data.password) {
            throw new z.ZodError([
              {
                path: ["password"],
                message: "Password should be provided",
                code: "custom",
              },
            ]);
          }
          return true;
        })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findFirst({
        where: { email: input.email },
      });

      // if no user and provider is credentials just sign up
      if (!existingUser) {
        // Create a new user
        const user = await ctx.prisma.user.create({
          data: {
            ...input,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            password: bcrypt.hashSync(input.password!, 10), // hash the password
          },
        });

        return {
          success: true,
          data: user,
        };
      }
      if (existingUser) {
        throw new z.ZodError([
          {
            path: ["email"],
            message: "Email already registered",
            code: "custom",
          },
        ]);
      }

      return { success: true, data: "no" };
    }),
});
