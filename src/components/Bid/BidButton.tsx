import React, { useEffect, useState } from "react";
import BidModalPortal from "./BidModal";
import BidButtonTimer from "./BidButtonTimer";

type BidButtonProps = {
  updatedAt?: Date;
  currentPrice: number;
  auctionId: string;
};


export default function BidButton(props: BidButtonProps) {
  const { updatedAt, currentPrice, auctionId } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [curUpdatedAt, setCurUpdatedAt] = useState(updatedAt)
  useEffect(() => {
    setCurUpdatedAt(updatedAt)
  }, [updatedAt])

  return (
    <>
      <BidButtonTimer setModalOpen={setModalOpen} updatedAt={curUpdatedAt} />
      {modalOpen ? (
        <BidModalPortal
          auctionId={auctionId}
          currentPrice={currentPrice}
          setModalOpen={setModalOpen}
          setCurUpdatedAt={setCurUpdatedAt}
        />
      ) : null}
    </>
  );
}
