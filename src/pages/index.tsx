import { type NextPage } from "next";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Layout from "~/components/Layout/Layout";

const Home: NextPage = () => {
  return (
    <Layout title={"Auction"} description={"Auction"} >
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-400 sm:text-[5rem]">
        Auction Online
      </h1>
      <div className="flex flex-col items-center gap-2">
        <AuthShowcase />
      </div>
    </Layout>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-gray-400">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-gray-400 no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
