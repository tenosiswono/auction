import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import moment from "moment";
import { uploadImg } from "~/utils/uploadImg";
import { type Auction } from "@prisma/client";
import { inngest } from "~/pages/api/inngest";
import { AUCTION_STATUS, PUBLIC_STATUS } from "~/constants/auction";
import { observable } from "@trpc/server/observable";
import { removeProperties } from "~/utils/api";

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
        const endDate = startDate.add(auction.duration, "hours");
        const auctionRes = await ctx.prisma.auction.update({
          where: { id: input.id },
          data: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            updatedAt: moment().toISOString(),
            status: AUCTION_STATUS.active,
          },
        });
        await inngest.send("app/auction.publish", {
          data: { id: auctionRes.id, endDate: auctionRes.endDate },
        });
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
        offset: z.number().nullish(),
        limit: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = [];
      if (input.status && PUBLIC_STATUS.indexOf(input.status) > -1) {
        whereClause.push({ status: input.status });
      } else {
        whereClause.push({
          status: {
            in: PUBLIC_STATUS,
          },
        });
      }

      const auctions = await ctx.prisma.auction.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              bids: true,
            },
          },
          ...(ctx.session?.user.id
            ? {
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
              }
            : {}),
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
  getMyAuctions: protectedProcedure
    .input(
      z.object({
        status: z.string().nullish(),
        offset: z.number().nullish(),
        limit: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = [];
      if (input.status) {
        whereClause.push({ status: input.status });
      } else {
        whereClause.push({
          status: {
            in: PUBLIC_STATUS,
          },
        });
      }
      whereClause.push({ creatorId: ctx.session.user.id });

      const auctions = await ctx.prisma.auction.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              bids: true,
            },
          },
          ...(ctx.session?.user.id
            ? {
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
              }
            : {}),
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
  onAuctionChange: publicProcedure
    .input(
      z.object({
        auctionId: z.string().nullish(),
      })
    )
    .subscription(({ ctx, input }) => {
      return observable<GetAuctionResponse>((emit) => {
        const onAuctionChange = (data: GetAuctionResponse) => {
          if (
            data.id === input.auctionId
          ) {
            if (data.bids?.[0]?.bidderId === ctx.session?.user.id) {
              emit.next(data);
            } else {
              emit.next({
                ...data,
                bids: undefined,
              });
            }
          }
        };
        ctx.ee.on("onAuctionChange", onAuctionChange);
        return () => {
          ctx.ee.off("onAuctionChange", onAuctionChange);
        };
      });
    }),
});

export type GetAuctionResponse = Auction & {
  bids?:
    | {
        updatedAt: Date;
        amount: number;
        bidderId: string;
        id: string;
      }[]
    | undefined;
  _count: {
    bids: number;
  };
  creator: {
    id: string;
    name: string | null;
  };
  winner: {
    id: string;
    name: string | null;
  } | null;
};