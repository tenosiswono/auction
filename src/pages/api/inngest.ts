/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { AUCTION_STATUS } from '~/constants/auction';
import { Inngest } from "inngest";
import { serve } from "inngest/next";
import moment from "moment";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { pusherServer } from '~/utils/pusher';

export const inngest = new Inngest({ name: "AuctionHive", eventKey: env.INNGEST_EVENT_KEY });


export const finishAuction = inngest.createFunction(
  { name: "Auction Publish" },
  { event: "app/auction.publish" },
  async ({ event, step }) => {
    if (event.data.id && event.data.endDate) {
      await step.sleepUntil(event.data.endDate as string)
      await step.run(`set the acution id ${event.data.id as string} to complete`, async () => {
        // This runs at the specified time.
        const auction = await prisma.auction.findFirst({
          where: { id: event.data.id },
          include: {
            bids: true
          }
        })
        if (auction) {
          if (moment().isAfter(moment(auction.endDate))) {
            await Promise.all(auction.bids.sort((a, b) => b.amount - a.amount).map( async (bid, index) => {
              if (index === 0) {
                await prisma.auction.update({
                  where: {
                    id: event.data.id
                  },
                  data: {
                    winnerId: bid.bidderId || null,
                    status: AUCTION_STATUS.completed
                  }
                })
              } else {
                // return bid to deposit
                const user = await prisma.user.findFirst({
                  where: {
                    id: bid.bidderId
                  },
                  select: {
                    deposit: true
                  }
                })
                const [userUpdate] = await prisma.$transaction([
                  prisma.user.update({
                    where: {
                      id: bid.bidderId,
                    },
                    data: {
                      deposit: (user?.deposit || 0) + bid.amount
                    },
                    select: {
                      deposit: true,
                      id: true
                    }
                  }),
                  prisma.depositHistory.create({
                    data: {
                      amount: bid.amount,
                      userId: bid.bidderId,
                      status: "credit"
                    }
                  })
                ])

                void pusherServer.trigger(`private-user-${bid.bidderId}`, 'update-deposit', {
                  deposit: userUpdate.deposit
                })
              }
            }))
          }
        }
      });
    }
  }
);

export default serve(inngest, [finishAuction]);