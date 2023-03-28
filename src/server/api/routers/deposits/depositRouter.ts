import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const depositRouter = createTRPCRouter({
  createDeposit: protectedProcedure
    .input(
      z
        .object({
          amount: z.number(),
          status: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
      let user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });
      user = await ctx.prisma.user.update({
        where: { 
          id: ctx.session.user.id,
        },
        data: {
          deposit: (user?.deposit || 0) + input.amount,
        }
      })
      const deposit = await ctx.prisma.depositHistory.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      ctx.ee.emit('onDepositChange', user);

      return {
        success: true,
        data: deposit ,
      };
    }),
});
