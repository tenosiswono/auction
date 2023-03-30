import React, { useEffect, useRef, useState } from "react";
import { AUCTION_STATUS } from "~/constants/auction";
import { padWithZeros } from "~/utils/transform";

type AuctionTimerProps = {
  duration: number;
  endDate: Date | null;
  status: string;
};

export default function AuctionTimer(props: AuctionTimerProps) {
  const { duration, endDate, status } = props;
  const interval = useRef<NodeJS.Timer>();

  const time = endDate
    ? endDate.getTime() - Date.now()
    : duration * 60 * 60 * 1000;

  const defaultHours = Math.floor(time / (1000 * 60 * 60));
  const defaultMinutes = Math.floor((time / 1000 / 60) % 60);
  const defaultSeconds = Math.floor((time / 1000) % 60);
  const [hours, setHours] = useState(defaultHours);
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [seconds, setSeconds] = useState(defaultSeconds);

  const getTime = (fromDate: Date) => {
    const time = fromDate.getTime() - Date.now();
    if (time <= 0) {
      clearInterval(interval.current);
    }
    setHours(Math.floor(time / (1000 * 60 * 60)));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    if (!!endDate && status === AUCTION_STATUS.active) {
      interval.current = setInterval(() => getTime(endDate), 1000);
      return () => clearInterval(interval.current);
    }
  }, [endDate, status]);

  return (
    <div>
      {hours >= 0 ? padWithZeros(hours, 2) : "--"}:
      {minutes >= 0 ? padWithZeros(minutes, 2) : "--"}:
      {seconds >= 0 ? padWithZeros(seconds, 2) : "--"}
    </div>
  );
}
