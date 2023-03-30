import React from "react";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";
import AuctionItem from "./AuctionItem/AuctionItem";
import { TbMoodEmpty } from "react-icons/tb";
import { AuctionListSkeleton } from "./AuctionItem/AuctionSkeleton";

type AuctionListProps = {
  isLoading: boolean;
  auctions: GetAuctionResponse[];
  keyStatus: string | number;
};

export default function AuctionList(props: AuctionListProps) {
  const { isLoading, auctions, keyStatus } = props;
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {isLoading ? (
        <AuctionListSkeleton />
      ) : auctions.length > 0 ? (
        auctions.map((auction) => (
          <AuctionItem key={`${keyStatus}-${auction.id}`} data={auction} />
        ))
      ) : (
        <div className="flex h-64 flex-1 flex-col items-center justify-center">
          <TbMoodEmpty className="mb-2 h-24 w-24 text-orange-200" />
          <div className="text-xl text-gray-600">Auction is Empty</div>
        </div>
      )}
    </div>
  );
}
