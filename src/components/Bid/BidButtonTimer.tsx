import React, { useEffect, useRef, useState } from "react";
import { TbLoader2 } from "react-icons/tb";

const TIME_DELAY = 5 * 1000;

type BidTimerProps = {
  updatedAt?: Date;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function BidTimer(props: BidTimerProps) {
  const { updatedAt, setModalOpen } = props;
  const time = updatedAt ? updatedAt.getTime() + TIME_DELAY - Date.now() : 0;
  const [seconds, setSeconds] = useState(Math.floor(time / 1000));
  const interval = useRef<NodeJS.Timer>()
  const openModal = () => {
    setModalOpen(true);
  };

  const getTime = (fromDate: Date) => {
    const time = fromDate.getTime() + TIME_DELAY - Date.now();
    if (time <= 0) {
      clearInterval(interval.current)
    }
    setSeconds(Math.floor(time / 1000));
  };

  useEffect(() => {
    if (!!updatedAt) {
      interval.current = setInterval(() => getTime(updatedAt), 1000);
      return () => clearInterval(interval.current);
    }
  }, [updatedAt]);

  return (
    <button
      className="btn btn-secondary px-3 py-2 text-xs"
      onClick={openModal}
      disabled={seconds > 0}
    >
      {seconds > 0 ? (
        <>
          <TbLoader2 className="mr-3 inline h-4 w-4 animate-spin" />
          {seconds}s
        </>
      ) : (
        "Bid"
      )}
    </button>
  );
}
