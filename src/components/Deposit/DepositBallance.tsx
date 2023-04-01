import React, { useEffect, useState } from "react";
import DepositButton from "./DepositButton";
import { api } from "~/utils/api";
import { usePusher } from "~/hooks/PusherProvider";

export default function DepositBallance() {
  const [ballance, setBallance] = useState<number>(0);
  const { privateChannel, publicChannel } = usePusher()

  const { data, isLoading } = api.user.getDepositBallance.useQuery();

  useEffect(() => {
    const priv = privateChannel?.bind('update-deposit', (data: { deposit: number}) => {
      console.log('pusher debug:', data)
      setBallance(data.deposit)
    })
    return () => {
      priv?.unbind()
    }
  }, [privateChannel, publicChannel])
  
  useEffect(() => {
    setBallance(data?.deposit || 0);
  }, [data?.deposit]);

  return (
    <li>
      <div className="flex items-center rounded-lg p-2 text-gray-800 hover:bg-orange-100">
        <div className="flex-1">Ballance:</div>
        {isLoading ? <div></div> : <span>${ballance}</span>}
        <DepositButton />
      </div>
    </li>
  );
}
