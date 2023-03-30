import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AUCTION_STATUS, PUBLIC_STATUS } from "~/constants/auction";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";
import { api } from "~/utils/api";


export default function useAuctions() {
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

  const { data, isLoading } = api.auction.getAuctions.useQuery({
    status,
  }, {
    refetchOnWindowFocus: false
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
