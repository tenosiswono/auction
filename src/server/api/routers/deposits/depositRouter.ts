import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pusherServer } from "~/utils/pusher";

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
      
      await pusherServer.trigger(`private-user-deposit-${ctx.session.user.id}`, 'update-deposit', {
        deposit: user.deposit
      })

      return {
        success: true,
        data: deposit,
      };
    }),
  getMyDeposit: protectedProcedure
    .input(
      z.object({
        offset: z.number().nullish(),
        limit: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deposits = await ctx.prisma.depositHistory.findMany({
        orderBy: { createdAt: "desc" },
        where: {
          userId: ctx.session.user.id,
        },
        take: input.limit || 12, // default 12
        skip: input.offset || 0,
      });
      return {
        success: true,
        data: deposits
      }
    }),
});
