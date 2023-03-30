import { type NextPage } from "next";
import Layout from "~/components/Layout";
import Auth from "~/components/Auth";
import { api } from "~/utils/api";
import moment from "moment";

const AuctionIndex: NextPage = () => {
  const { data, isLoading } = api.deposit.getMyDeposit.useQuery({});

  return (
    <Auth>
      <Layout title={"AuctionHive - My Auctions"}>
        <h1 className="mb-4 text-3xl font-bold">My Deposit History</h1>
        <div>
          {isLoading ? (
            <div>loading...</div>
          ) : (
            data?.data.map((dep) => (
              <div key={dep.id} className="flex flex-row my-2 rounded-lg border border-gray-200 bg-white p-4">
                <div className="w-64">{moment(dep.createdAt).format('HH:mm DD-MM-YYYY')}</div>
                <div className="w-32">{dep.status}</div>
                <div className="flex-1 text-right">${dep.amount}</div>
              </div>
            ))
          )}
        </div>
      </Layout>
    </Auth>
  );
};

export default AuctionIndex;
