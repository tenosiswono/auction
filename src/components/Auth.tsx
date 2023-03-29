/** @format */
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type ReactNode } from "react";
import Layout from "./Layout";

const Auth = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const { push } = useRouter()

  if (status === "loading") {
    return (
      <>
        <Layout title="Loading">
        </Layout>
      </>
    );
  }

  if (status === "unauthenticated") {
    void push('/auth/signin')
    return null
  }

  return <>{children}</>;
};

export default Auth;
