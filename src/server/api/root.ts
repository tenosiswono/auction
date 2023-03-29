import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "~/server/api/routers/users";
import { depositRouter } from "~/server/api/routers/deposits";
import { auctionRouter } from '~/server/api/routers/auctions';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  deposit: depositRouter,
  auction: auctionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
