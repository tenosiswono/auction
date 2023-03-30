import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const depositRouter = createTRPCRouter({
  createDeposit: protectedProcedure
    .input(
      z.object({
        amount: z.number().gt(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userInit = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });

      const [user, deposit] = await ctx.prisma.$transaction([
        ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            deposit: (userInit?.deposit || 0) + input.amount,
          },
        }),
        ctx.prisma.depositHistory.create({
          data: {
            ...input,
            status: "credit",
            userId: ctx.session.user.id,
          },
        }),
      ]);

      ctx.ee.emit("onDepositChange", user);

      return {
        success: true,
        data: deposit,
      };
    }),
});
