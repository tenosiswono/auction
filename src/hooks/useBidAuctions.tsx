import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AUCTION_STATUS, PUBLIC_STATUS } from "~/constants/auction";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";
import { api } from "~/utils/api";


export default function useBidAuctions() {
  const router = useRouter();
  const { status: qStatus } = router.query;
  let initStatus: string;
  const qStatusString = (qStatus || "").toString();

  if (PUBLIC_STATUS.indexOf(qStatusString) < 0) {
    initStatus = AUCTION_STATUS.active;
  } else {
    initStatus = qStatusString;
  }

  const [status, setStatus] = useState(initStatus);
  const [auctions, setAuctions] = useState<GetAuctionResponse[]>([]);

  const { data, isLoading, refetch } = api.auction.getBidAuctions.useQuery({
    status,
  }, {
    refetchOnWindowFocus: false,
    cacheTime: 0
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
    void refetch()
  }
  return {
    status,
    setStatus: setStatusQuery,
    auctions,
    isLoading,
  };
}
