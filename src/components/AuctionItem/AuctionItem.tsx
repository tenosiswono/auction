import { type Auction, type Bid, type User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";
import { TbUsers } from "react-icons/tb";
import AuctionStatus from "./AuctionStatus";
import { AUCTION_STATUS } from "~/constants/auction";
import AuctionTimer from "./AuctionTimer";
import { api } from "~/utils/api";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";
import { useRouter } from "next/router";

type AuctionItemProps = {
  data: GetAuctionResponse;
};

export default function AuctionItem(props: AuctionItemProps) {
  const { data } = props;
  const { data: sessioData } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const ownAuction = data.creatorId === sessioData?.user.id;

  const publishAuction = api.auction.publishAuction.useMutation();

  const onPublish = async () => {
    if (ownAuction) {
      try {
        setLoading(true);
        await publishAuction.mutateAsync({
          id: data.id,
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
        src={data.image}
        alt={data.title}
        height={224}
        width={224}
      />
      <div className="px-4 pb-4 pt-2">
        <div className="mb-1 flex flex-row items-center text-sm text-gray-600">
          <TbUsers className="mr-1" />
          <span className="flex-1">{data.bids.length} bids</span>
          <AuctionStatus status={data.status} />
        </div>
        <div
          className="mb-2 h-14 border-b border-dashed text-lg font-semibold line-clamp-2"
          title={data.title}
        >
          {data.title}
        </div>
        <div className="mb-1 flex flex-row items-end text-sm text-gray-800">
          <span className="flex-1">Current price:</span>
          <span className="text-lg font-semibold">${data.currentPrice}</span>
        </div>
        <div className="flex flex-row items-center h-8">
          {data.status !== AUCTION_STATUS.completed ? 
          <div className="flex-1 text-sm text-gray-600">
            <AuctionTimer
              duration={data.duration}
              endDate={data.endDate}
              status={data.status}
            />
          </div> : <div className="text-sm text-gray-600 line-clamp-1">Winner: {data.winner?.name || '-'}</div>}
          {data.creatorId !== sessioData?.user.id &&
          data.status === AUCTION_STATUS.active ? (
            <button className="btn btn-secondary px-3 py-2 text-xs">Bid</button>
          ) : null}
          {ownAuction && data.status === AUCTION_STATUS.draft ? (
            <button
              className="btn btn-secondary px-3 py-2 text-xs w-16"
              onClick={onPublish}
              disabled={loading}
            >
              {loading ? (
                <svg
                  aria-hidden="true"
                  role="status"
                  className="mx-auto inline h-4 w-4 animate-spin text-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
              ) : "Publish"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
