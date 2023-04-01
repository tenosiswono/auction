import useAuctions from "~/hooks/useAuctions";
import { capitalizeWord } from "~/utils/transform";
import { AuctionListSkeleton } from "~/components/AuctionItem/AuctionSkeleton";
import { TbMoodEmpty } from "react-icons/tb";
import { Fragment } from "react";
import AuctionItem from "~/components/AuctionItem/AuctionItem";

type AuctionListProps = {
  page: "index" | "me" | "bid";
  title: string;
};

const AuctionList = (props: AuctionListProps) => {
  const { page, title } = props;
  const {
    status,
    statusFilter,
    setStatus,
    auctions,
    isLoading,
    refInview,
    hasNextPage,
    isFetchingNextPage,
  } = useAuctions({ page });
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">{title}</h1>
      <div className="mb-4 border-b border-gray-200 text-center text-sm font-medium text-gray-500">
        <ul className="-mb-px flex flex-wrap">
          {statusFilter.map((ps) => (
            <li key={`${page}-${ps}`} className="mr-2">
              <button
                data-active={status === ps}
                onClick={() => setStatus(ps)}
                className="tab-nav"
              >
                {capitalizeWord(ps)}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-row flex-wrap gap-4">
        {isLoading ? (
          <AuctionListSkeleton prefixKey="loader-init" />
        ) : auctions?.pages &&
          auctions?.pages.length &&
          auctions?.pages[0] &&
          auctions?.pages[0].data.length > 0 ? (
          auctions?.pages.map((page) => (
            <Fragment key={`page-fragment-${page.nextCursor || 'last'}`}>
              {page.data.map((auction) => (
                <AuctionItem
                  key={`index-${status}-${page.nextCursor || ""}}-${
                    auction.id
                  }`}
                  data={auction}
                />
              ))}
            </Fragment>
          ))
        ) : (
          <div
            className="flex h-64 flex-1 flex-col items-center justify-center"
            key="empty-state"
          >
            <TbMoodEmpty className="mb-2 h-24 w-24 text-orange-200" />
            <div className="text-xl text-gray-600">Auction is Empty</div>
          </div>
        )}
        {isFetchingNextPage ? (
          <AuctionListSkeleton prefixKey="loader-inview" />
        ) : hasNextPage ? (
          <div ref={refInview} key="inview-anchor"></div>
        ) : null}
      </div>
    </>
  );
};

export default AuctionList;
