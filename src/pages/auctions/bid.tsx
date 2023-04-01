import { type NextPage } from "next";
import Layout from "~/components/Layout";
import AuctionList from "~/components/AuctionList";
import Auth from "~/components/Auth";

const AuctionIndex: NextPage = () => {
  return (
    <Auth>
      <Layout title={"AuctionHive - Bid Auctions"}>
        <AuctionList page="bid" title={"Bid Auctions"} />
      </Layout>
    </Auth>
  );
};

export default AuctionIndex;
