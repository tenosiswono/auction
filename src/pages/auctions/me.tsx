import { type NextPage } from "next";
import Layout from "~/components/Layout";
import AuctionList from "~/components/AuctionList";
import Auth from "~/components/Auth";

const AuctionIndex: NextPage = () => {
  return (
    <Auth>
      <Layout title={"AuctionHive - My Auctions"}>
        <AuctionList page="me" title={"My Auctions"} />
      </Layout>
    </Auth>
  );
};

export default AuctionIndex;
