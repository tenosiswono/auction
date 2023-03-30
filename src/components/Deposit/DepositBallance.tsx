import React, { useEffect, useState } from "react";
import DepositButton from "./DepositButton";
import { api } from "~/utils/api";

export default function DepositBallance() {
  const [ballance, setBallance] = useState<number>(0);

  const { data, isLoading } = api.user.getDepositBallance.useQuery();

  api.user.onDepositChange.useSubscription(undefined, {
    onData(data) {
      setBallance(data.deposit);
    },
  });

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