import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Pusher, { type Channel } from "pusher-js";
import { env } from "~/env.mjs";
import { useSession } from "next-auth/react";

type PusherContextType = {
  privateDepositChannel?: Channel;
  privateBidsChannel?: Channel;
  publicChannel?: Channel;
};

const PusherContext = createContext<PusherContextType | null>(null);

type PusherProviderProps = {
  children: React.ReactNode;
};

const PusherProvider = ({ children }: PusherProviderProps) => {
  const pusherClient = useRef<Pusher>()
  useEffect(() => {
    if (!pusherClient.current) {
      pusherClient.current = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: "/api/pusher/auth-user",
      });
    }
  }, [])
  const { data: sessionData } = useSession();
  const [privateDepositChannel, setPrivateDepositChannel] = useState<Channel | undefined>();
  const [privateBidsChannel, setPrivateBidsChannel] = useState<Channel | undefined>();
  const [publicChannel, setPublicChannel] = useState<Channel | undefined>();
  useEffect(() => {
    if (pusherClient.current) {
      pusherClient.current.connect();
      if (sessionData?.user.id) {
        setPrivateDepositChannel(
          pusherClient.current.subscribe(`private-user-deposit-${sessionData.user.id}`)
        );
        setPrivateBidsChannel(
          pusherClient.current.subscribe(`private-user-bids-${sessionData.user.id}`)
        );
      }
      setPublicChannel(pusherClient.current.subscribe(`public-auction`));
      return () => {
        setPrivateDepositChannel(undefined);
        setPrivateBidsChannel(undefined);
        setPublicChannel(undefined);
        pusherClient?.current?.disconnect();
      };
    }
  }, [sessionData?.user.id]);
  return (
    <PusherContext.Provider
      value={{
        privateDepositChannel,
        privateBidsChannel,
        publicChannel,
      }}
    >
      {children}
    </PusherContext.Provider>
  );
};

const usePusher = () => {
  const pusher = useContext(PusherContext);
  if (!pusher) {
    throw new Error("usePusher must be used within a PusherProvider");
  }
  return pusher;
};

export { PusherProvider, usePusher };
