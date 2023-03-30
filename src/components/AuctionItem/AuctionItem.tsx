import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { TbLoader2, TbUsers } from "react-icons/tb";
import AuctionStatus from "./AuctionStatus";
import { AUCTION_STATUS } from "~/constants/auction";
import AuctionTimer from "./AuctionTimer";
import { api } from "~/utils/api";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";
import { useRouter } from "next/router";
import BidButton from "../Bid/BidButton";

type AuctionItemProps = {
  data: GetAuctionResponse;
};

export default function AuctionItem(props: AuctionItemProps) {
  const { data } = props;
  const { data: sessioData } = useSession();
  const [auction, setAuction] = useState(data);
  // auctionRef for subscription to work properly
  const auctionRef = useRef(data);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  if (auction.status === AUCTION_STATUS.active) {
    api.auction.onAuctionChange.useSubscription(
      { auctionId: auction.id },
      {
        onData: (data) => {
          const newAuction: GetAuctionResponse = {
            ...auctionRef.current,
            currentPrice: data.currentPrice,
            _count: {
              bids: data._count.bids,
            },
            ...(data.bids
              ? {
                  bids: data.bids,
                }
              : {}),
          }
          auctionRef.current = newAuction
          setAuction(newAuction);
        },
      }
    );
  }
  const ownAuction = auction.creatorId === sessioData?.user.id;

  const publishAuction = api.auction.publishAuction.useMutation();

  const onPublish = async () => {
    if (ownAuction) {
      try {
        setLoading(true);
        await publishAuction.mutateAsync({
          id: auction.id,
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    await router.push("/auctions/me?status=active");
  };
  return (
    <div className="w-56 rounded-lg border border-gray-200 bg-white">
      <Image
        className="h-56 w-56 rounded-t-lg"
        src={auction.image}
        alt={auction.title}
        height={224}
        width={224}
      />
      <div className="px-4 pb-4 pt-2">
        <div className="mb-1 flex flex-row items-center text-sm text-gray-600">
          <TbUsers className="mr-1" />
          <span className="flex-1">{auction._count.bids} bids</span>
          <AuctionStatus status={auction.status} />
        </div>
        <div
          className="mb-2 h-14 border-b border-dashed text-lg font-semibold line-clamp-2"
          title={auction.title}
        >
          {auction.title}
        </div>
        <div className="mb-1 flex flex-row items-end text-sm text-gray-800">
          <span className="flex-1">Current price:</span>
          <span className="text-lg font-semibold">${auction.currentPrice}</span>
        </div>
        <div className="flex h-8 flex-row items-center">
          {auction.status !== AUCTION_STATUS.completed ? (
            <div className="flex-1 text-sm text-gray-600">
              <AuctionTimer
                duration={auction.duration}
                endDate={auction.endDate}
                status={auction.status}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-600 line-clamp-1">
              Winner: {auction.winner?.name || "-"}
            </div>
          )}
          {sessioData?.user.id && auction.creatorId !== sessioData?.user.id &&
          auction.status === AUCTION_STATUS.active ? (
            <BidButton
              updatedAt={auction.bids?.[0]?.updatedAt}
              currentPrice={auction.currentPrice}
              auctionId={auction.id}
            />
          ) : null}
          {ownAuction && auction.status === AUCTION_STATUS.draft ? (
            <button
              className="btn btn-secondary w-16 px-3 py-2 text-xs"
              onClick={onPublish}
              disabled={loading}
            >
              {loading ? (
                <TbLoader2 className="mx-auto inline h-4 w-4 animate-spin " />
              ) : (
                "Publish"
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
