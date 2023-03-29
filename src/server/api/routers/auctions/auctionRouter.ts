import { publicProcedure } from "./../../trpc";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import moment from "moment";
import { uploadImg } from "~/utils/uploadImg";
import { type Auction } from "@prisma/client";
import { inngest } from "~/pages/api/inngest";
import { AUCTION_STATUS } from "~/constants/auction";

export const auctionRouter = createTRPCRouter({
  createAuction: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, { message: "Title is required" }),
        duration: z
          .number()
          .gte(1, { message: "Duration must be larger or equal than 1" }),
        startingPrice: z
          .number()
          .gt(0, { message: "Starting Price must be larger than 0" }),
        image: z.string().min(1, { message: "Image is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { imageUrl, error } = await uploadImg(input.image);
      if (error) {
        throw new z.ZodError([
          {
            path: ["image"],
            message: "Image Upload Error",
            code: "custom",
          },
        ]);
      }
      await ctx.prisma.auction.create({
        data: {
          ...input,
          image: imageUrl,
          creatorId: ctx.session.user.id,
          currentPrice: input.startingPrice,
        },
      });
      return {
        success: true,
      };
    }),
  publishAuction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const auction = await ctx.prisma.auction.findFirst({
        where: {
          AND: [{ id: input.id }, { creatorId: ctx.session.user.id }],
        },
      });
      if (auction) {
        const startDate = moment();
        const endDate = startDate.add(auction.duration, "minutes");
        const auctionRes = await ctx.prisma.auction.update({
          where: { id: input.id },
          data: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: AUCTION_STATUS.active,
          },
        });
        await inngest.send("app/auction.publish", { data: { id: auctionRes.id, endDate: auctionRes.endDate } })
        return {
          success: true,
        };
      }
      throw new z.ZodError([
        {
          path: ["id"],
          message: "Invalid Auction Id",
          code: "custom",
        },
      ]);
    }),
  getAuctions: publicProcedure
    .input(
      z.object({
        status: z.string().nullish(),
        creatorId: z.string().nullish(),
        offset: z.number().nullish(),
        limit: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = [];
      if (input.status) {
        whereClause.push({ status: input.status });
      }
      if (input.creatorId) {
        whereClause.push({ creatorId: input.creatorId });
      }
      const auctions = await ctx.prisma.auction.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          bids: {
            select: {
              bidderId: true,
              amount: true,
            },
          },
          winner: {
            select: {
              name: true,
              id: true,
            },
          },
          creator: {
            select: {
              name: true,
              id: true,
            },
          },
        },
        take: input.limit || 12, // default 12
        skip: input.offset || 0,
        where:
          whereClause.length > 0
            ? {
                AND: whereClause,
              }
            : undefined,
      });
      return {
        success: true,
        data: auctions,
      };
    }),
});

export type GetAuctionResponse = Auction & {
  bids: {
    amount: number;
    bidderId: string;
  }[];
  creator: {
    id: string;
    name: string | null;
  };
  winner: {
    id: string;
    name: string | null;
  } | null;
};
