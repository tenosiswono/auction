import moment from "moment";
import { AUCTION_STATUS } from "~/constants/auction";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pusherServer } from "~/utils/pusher";
import { type GetAuctionResponse } from "../auctions/auctionRouter";
import { User } from "@prisma/client";

export const bidRouter = createTRPCRouter({
  createBid: protectedProcedure
    .input(
      z.object({
        amount: z.number().gt(0),
        auctionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const auction = await ctx.prisma.auction.findFirst({
        where: {
          id: input.auctionId,
        },
        include: {
          bids: {
            where: {
              bidderId: ctx.session.user.id,
            },
          },
        },
      });
      if (!auction) {
        throw new z.ZodError([
          {
            path: ["auction"],
            message: "Auction is not exist",
            code: "custom",
          },
        ]);
      }
      if (auction.status !== AUCTION_STATUS.active) {
        throw new z.ZodError([
          {
            path: ["auction"],
            message: "Auction is not active",
            code: "custom",
          },
        ]);
      }
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });
      if (!user) {
        throw new z.ZodError([
          {
            path: ["user"],
            message: "User is not exist",
            code: "custom",
          },
        ]);
      }
      if (auction.currentPrice >= input.amount) {
        throw new z.ZodError([
          {
            path: ["amount"],
            message: "Amount is less or equal than current price",
            code: "custom",
          },
        ]);
      }
      const userBid = auction.bids[0];
      const lastAmount = userBid?.amount || 0;
      const amountDebit = input.amount - lastAmount;
      if (
        userBid &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        moment(userBid.updatedAt).add(5, "seconds").isAfter(moment())
      ) {
        throw new z.ZodError([
          {
            path: ["amount"],
            message: "Wait for few seconds before bid again",
            code: "custom",
          },
        ]);
      }
      if (amountDebit >= user.deposit) {
        throw new z.ZodError([
          {
            path: ["amount"],
            message: "Amount is greater that deposit ballance",
            code: "custom",
          },
        ]);
      }

      const transactionResults = await ctx.prisma.$transaction([
        ...(userBid
          ? [
              ctx.prisma.bid.update({
                where: {
                  id: userBid.id,
                },
                data: {
                  amount: input.amount,
                  updatedAt: moment().toISOString(),
                },
                select: {
                  id: true,
                  updatedAt: true,
                  amount: true,
                },
              }),
            ]
          : [
              ctx.prisma.bid.create({
                data: {
                  amount: input.amount,
                  bidderId: ctx.session.user.id,
                  auctionId: input.auctionId,
                },
                select: {
                  id: true,
                  updatedAt: true,
                  amount: true,
                },
              }),
            ]),
        ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            deposit: user.deposit - amountDebit,
          },
        }),
        ctx.prisma.depositHistory.create({
          data: {
            amount: amountDebit,
            status: "debit",
            userId: ctx.session.user.id,
          },
          select: {
            id: true,
          },
        }),
        ctx.prisma.auction.update({
          where: {
            id: input.auctionId,
          },
          data: {
            currentPrice: input.amount,
            updatedAt: moment().toISOString(),
          },
          select: {
            _count: {
              select: {
                bids: true,
              },
            },
            bids: {
              where: {
                bidderId: ctx.session.user.id,
              },
              select: {
                bidderId: true,
                updatedAt: true,
                amount: true,
                id: true,
              },
            },
            currentPrice: true,
            id: true,
          },
        }),
      ]);
      const auctionUpdate = transactionResults[3] as GetAuctionResponse;
      const bid = transactionResults[0] as {
        id: string;
        updatedAt: Date;
        amount: number;
      };
      const userUpdate = transactionResults[1] as User
      void pusherServer.trigger(
        "public-auction",
        `update-auction-${auctionUpdate.id}`,
        {
          currentPrice: auctionUpdate.currentPrice,
          bids: auctionUpdate._count.bids,
        }
      );
      void pusherServer.trigger(`private-user-${ctx.session.user.id}`, 'update-deposit', {
        deposit: userUpdate.deposit
      })

      return {
        success: true,
        data: bid,
      };
    }),
});
