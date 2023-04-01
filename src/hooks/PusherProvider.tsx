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
  privateChannel?: Channel;
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
  const [privateChannel, setPrivateChannel] = useState<Channel | undefined>();
  const [publicChannel, setPublicChannel] = useState<Channel | undefined>();
  useEffect(() => {
    if (pusherClient.current) {
      pusherClient.current.connect();
      if (sessionData?.user.id) {
        setPrivateChannel(
          pusherClient.current.subscribe(`private-user-${sessionData.user.id}`)
        );
      }
      setPublicChannel(pusherClient.current.subscribe(`public-auction`));
      return () => {
        setPrivateChannel(undefined);
        setPublicChannel(undefined);
        pusherClient?.current?.disconnect();
      };
    }
  }, [sessionData?.user.id]);
  return (
    <PusherContext.Provider
      value={{
        privateChannel,
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
