import { type NextPage } from "next";
import Layout from "~/components/Layout";
import AuctionList from "~/components/AuctionList";

const AuctionIndex: NextPage = () => {
  return (
    <Layout title={"AuctionHive - List Auctions"}>
      <AuctionList page="index" title={"List Auctions"} />
    </Layout>
  );
};

export default AuctionIndex;
