import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AUCTION_STATUS, PRIVATE_STATUS } from "~/constants/auction";
import { type GetAuctionResponse } from "~/server/api/routers/auctions/auctionRouter";
import { api } from "~/utils/api";


export default function useMyAuctions() {
  const router = useRouter();
  const { status: qStatus } = router.query;
  let initStatus: string;
  const qStatusString = (qStatus || "").toString();

  if (PRIVATE_STATUS.indexOf(qStatusString) < 0) {
    initStatus = AUCTION_STATUS.active;
  } else {
    initStatus = qStatusString;
  }

  const [status, setStatus] = useState(initStatus);
  const [auctions, setAuctions] = useState<GetAuctionResponse[]>([]);

  const { data, isLoading } = api.auction.getMyAuctions.useQuery({
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
