import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { AUCTION_STATUS, PRIVATE_STATUS, PUBLIC_STATUS } from "~/constants/auction";
import { api } from "~/utils/api";

const mapProcedure = {
  index: api.auction.getAuctions,
  me: api.auction.getMyAuctions,
  bid: api.auction.getBidAuctions
}
type useAuctionsProps = {
  page: 'index' | 'me' | 'bid'
}
export default function useAuctions({ page } :useAuctionsProps) {
  const router = useRouter();
  const { ref: refInview, inView } = useInView();

  const { status: qStatus } = router.query;
  let initStatus: string;
  const qStatusString = (qStatus || "").toString();
  const statusFilter = page === 'me' ? PRIVATE_STATUS : PUBLIC_STATUS

  if (statusFilter.indexOf(qStatusString) < 0) {
    initStatus = AUCTION_STATUS.active;
  } else {
    initStatus = qStatusString;
  }

  const [status, setStatus] = useState(initStatus);

  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = mapProcedure[page].useInfiniteQuery(
    {
      status,
    },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
      getNextPageParam: (lastPage): string | undefined => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    setStatus(initStatus);
  }, [initStatus]);

  const setStatusQuery = (status: string) => {
    void router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        status,
      },
    });
    setStatus(status);
  };

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return {
    status,
    statusFilter,
    setStatus: setStatusQuery,
    auctions: data,
    isLoading,
    refInview,
    hasNextPage,
    isFetchingNextPage,
  };
}
