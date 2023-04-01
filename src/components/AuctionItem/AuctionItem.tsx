import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { TbChessQueen, TbLoader2, TbUsers } from "react-icons/tb";
import AuctionStatus from "./AuctionStatus";
import { AUCTION_STATUS } from "~/constants/auction";
import AuctionTimer from "./AuctionTimer";
import { api } from "~/utils/api";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";
import { useRouter } from "next/router";
import BidButton from "../Bid/BidButton";
import moment from "moment";
import { usePusher } from "~/hooks/PusherProvider";

type AuctionItemProps = {
  data: GetAuctionResponse;
};

export default function AuctionItem(props: AuctionItemProps) {
  const { data } = props;
  const { data: sessioData } = useSession();
  const { publicChannel } = usePusher();
  const [auction, setAuction] = useState(data);
  // auctionRef for subscription to work properly
  const auctionRef = useRef(data);
  const router = useRouter();

  useEffect(() => {
    const pub = publicChannel?.bind(
      `update-auction-${auction.id}`,
      (data: {
        currentPrice?: number;
        bids?: number;
        winnerId?: string;
        status?: string;
        winner?: {
          id: string;
          name: string | null;
        } | null;
      }) => {
        const newAuction: GetAuctionResponse = auctionRef.current;
        if (data.currentPrice) {
          newAuction.currentPrice = data.currentPrice;
        }
        if (data.bids) {
          newAuction._count.bids = data.bids;
        }
        if (data.winnerId) {
          newAuction.winnerId = data.winnerId;
        }
        if (data.status) {
          newAuction.status = data.status;
        }
        if (data.winner) {
          newAuction.winner = data.winner;
        }
        auctionRef.current = newAuction;
        setAuction(newAuction);
      }
    );
    return () => {
      pub?.unbind();
    };
  }, [auction.id, publicChannel]);

  useEffect(() => {
    setAuction(data);
  }, [data]);

  const ownAuction = auction.creatorId === sessioData?.user.id;

  const publishAuction = api.auction.publishAuction.useMutation();

  const onPublish = async () => {
    if (ownAuction) {
      try {
        await publishAuction.mutateAsync({
          id: auction.id,
        });
      } catch (e) {
        console.error(e);
      }
    }
    await router.push("/auctions/me?status=active");
  };
  let extendStatus = auction.status;
  if (auction.bids?.[0]) {
    if (auction.bids?.[0].amount !== auction.currentPrice) {
      extendStatus = "Outbidded!";
    } else if (auction.winnerId && auction.winnerId === sessioData?.user.id) {
      extendStatus = "Winner!";
    } else {
      extendStatus = "Outbid!";
    }
  }
  return (
    <div className="w-56 rounded-lg border border-gray-200 bg-white">
      <div
        className="relative flex items-center justify-center rounded-t-lg"
        style={{
          height: 222,
          width: 222,
        }}
      >
        <Image
          src={auction.image}
          alt={auction.title}
          fill
          sizes="222px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="mb-1 flex flex-row items-center text-sm text-gray-600">
          <TbUsers className="mr-1" />
          <span className="flex-1">{auction._count.bids} bids</span>
          <AuctionStatus status={extendStatus} />
        </div>
        <div
          className="mb-2 h-14 border-b border-dashed text-lg font-semibold line-clamp-2"
          title={auction.title}
        >
          {auction.title}
        </div>
        <div className="mb-1 flex flex-row items-end text-sm text-gray-800">
          <span className="flex-1">Current price</span>
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
            <div className="flex flex-row items-center text-sm text-gray-600">
              <TbChessQueen className="mr-1 text-yellow-500" />{" "}
              <div className="line-clamp-1">{auction.winner?.name || "-"}</div>
            </div>
          )}
          {sessioData?.user.id &&
          auction.creatorId !== sessioData?.user.id &&
          auction.status === AUCTION_STATUS.active &&
          moment(auction.endDate).isAfter(moment()) ? (
            <BidButton
              updatedAt={auction.bids?.[0]?.updatedAt}
              currentPrice={auction.currentPrice}
              auctionId={auction.id}
            />
          ) : null}
          {ownAuction && auction.status === AUCTION_STATUS.draft ? (
            <button
              className="btn btn-secondary w-16 px-3 py-2 text-xs"
              data-testid="btn-publish"
              onClick={onPublish}
              disabled={publishAuction.isLoading}
            >
              {publishAuction.isLoading ? (
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
