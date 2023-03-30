import { type NextPage } from "next";
import Layout from "~/components/Layout";
import Auth from "~/components/Auth";
import AuctionList from "~/components/AuctionList";
import { capitalizeWord } from "~/utils/transform";
import { PUBLIC_STATUS } from "~/constants/auction";
import useBidAuctions from "~/hooks/useBidAuctions";

const AuctionIndex: NextPage = () => {
  const { status, setStatus, auctions, isLoading } = useBidAuctions();

  return (
    <Auth>
      <Layout title={"AuctionHive - My Auctions"}>
        <h1 className="mb-4 text-3xl font-bold">My Bid Auctions</h1>
        <div className="mb-4 border-b border-gray-200 text-center text-sm font-medium text-gray-500">
          <ul className="-mb-px flex flex-wrap">
            {PUBLIC_STATUS.map((ps) => (
              <li key={`public-${ps}`} className="mr-2">
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
        <AuctionList isLoading={isLoading} auctions={auctions} keyStatus={status} />
      </Layout>
    </Auth>
  );
};

export default AuctionIndex;
