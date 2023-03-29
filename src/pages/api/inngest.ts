import { AUCTION_STATUS } from '~/constants/auction';
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { type Bid } from "@prisma/client";
import { Inngest } from "inngest";
import { serve } from "inngest/next";
import moment from "moment";
import { env } from "~/env";
import { prisma } from "~/server/db";

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
            const higestBid = auction.bids.reduce((prev: Bid | null, cur: Bid) => {
              if (!prev || cur.amount > prev.amount) {
                return cur
              }
              return prev
            }, null)
            await prisma.auction.update({
              where: {
                id: event.data.id
              },
              data: {
                winnerId: higestBid?.id || null,
                status: AUCTION_STATUS.completed
              }
            })
          }
        }
      });
    }
  }
);

export default serve(inngest, [finishAuction]);