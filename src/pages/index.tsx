import { type NextPage } from "next";
import AuctionList from "~/components/AuctionList";
import Layout from "~/components/Layout";

const HOWS = [
  {
    title: "Player Deposits Required",
    description:
      "In order to participate in the auction, each user is required to make a deposit.",
  },
  {
    title: "5 Second Bidding Intervals",
    description:
      "Bid with confidence knowing that each bid is spaced out with a 5 second interval.",
  },
  {
    title: "No Minimum Bid Price",
    description:
      "Bid any amount that is higher than the current price and increase your chances of winning the auction.",
  },
  {
    title: "Winner Announced at Auction Close",
    description:
      "The winner will be announced at the end of the auction timer.",
  },
];

const Home: NextPage = () => {
  return (
    <Layout>
      <div className="mb-12">
        <h3 className="text-md mb-4 font-medium text-gray-600">
          Join the hive and become a top bidder. Discover a new world of
          exciting auctions
        </h3>
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-800 md:text-5xl lg:text-6xl">
          Bee the highest bidder with
        </h1>
        <h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-800 md:text-5xl lg:text-6xl">
          Auction<span className="text-orange-400">Hive</span>
        </h1>
      </div>
      <div className="mb-12">
        <h4 className="text-md mb-4 font-bold text-gray-800">How its Works</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {HOWS.map((how, index) => (
            <div
              className="rounded-lg border border-gray-200 bg-white p-4"
              key={`how-${index}`}
            >
              <h2 className="text-md mb-2 font-semibold">{how.title}</h2>
              <p className="text-sm text-gray-600">{how.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-12">
        <AuctionList page="index" title={"Featured Auctions"} />
      </div>
    </Layout>
  );
};

export default Home;
