import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AUCTION_STATUS } from "~/constants/auction";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";
import { api } from "~/utils/api";

type UseAuctionsOpts = {
  isPrivate: boolean;
};

export const PUBLIC_STATUS: string[] = [
  AUCTION_STATUS.active,
  AUCTION_STATUS.completed,
];

export const PRIVATE_STATUS: string[] = [
  ...PUBLIC_STATUS,
  AUCTION_STATUS.draft,
  AUCTION_STATUS.cancelled,
];

export default function useAuctions({ isPrivate }: UseAuctionsOpts) {
  const router = useRouter();
  const { status: qStatus } = router.query;
  let initStatus: string;
  const qStatusString = (qStatus || "").toString();

  if (!isPrivate && PUBLIC_STATUS.indexOf(qStatusString) < 0) {
    initStatus = AUCTION_STATUS.active;
  } else if (PRIVATE_STATUS.indexOf(qStatusString) < 0) {
    initStatus = AUCTION_STATUS.active;
  } else {
    initStatus = qStatusString;
  }

  const [status, setStatus] = useState(initStatus);
  const [auctions, setAuctions] = useState<GetAuctionResponse[]>([]);

  const { data, isLoading } = api.auction.getAuctions.useQuery({
    status,
  });
  
  useEffect(() => {
    setStatus(initStatus)
  }, [initStatus])

  useEffect(() => {
    if (data?.data) {
      setAuctions(data.data);
    }
  }, [data]);

  const setStatusQuery = (status: string) => {
    void router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        status,
      }
    })
    setStatus(status)
    setAuctions([])
  }
  return {
    status,
    setStatus: setStatusQuery,
    auctions,
    isLoading,
  };
}
