import React, { useState } from "react";
import BidModalPortal from "./BidModal";
import BidTimer from "./BidButtonTimer";

type BidButtonProps = {
  updatedAt?: Date;
  currentPrice: number;
  auctionId: string;
};


export default function BidButton(props: BidButtonProps) {
  const { updatedAt, currentPrice, auctionId } = props;
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <BidTimer setModalOpen={setModalOpen} updatedAt={updatedAt} />
      {modalOpen ? (
        <BidModalPortal
          auctionId={auctionId}
          currentPrice={currentPrice}
          setModalOpen={setModalOpen}
        />
      ) : null}
    </>
  );
}
