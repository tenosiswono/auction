import { type NextPage } from "next";
import Layout from "~/components/Layout";
import useAuctions from "~/hooks/useAuctions";
import AuctionList from "~/components/AuctionList";
import { capitalizeWord } from "~/utils/transform";
import { PUBLIC_STATUS } from "~/constants/auction";

const AuctionIndex: NextPage = () => {
  const { status, setStatus, auctions, isLoading } = useAuctions();
  return (
    <Layout title={"AuctionHive - List Auctions"}>
      <h1 className="mb-4 text-3xl font-bold">List Auctions</h1>
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
      <AuctionList isLoading={isLoading} auctions={auctions} />
    </Layout>
  );
};

export default AuctionIndex;
