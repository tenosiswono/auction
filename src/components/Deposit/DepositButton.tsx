import React, { useState } from "react";
import DepositModalPortal from "./DepositModal";

export default function DepositButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => {
    setModalOpen(true);
  };
  return (
    <>
      <button
        className="btn-primary ml-2 h-6 w-6 rounded-full p-0"
        onClick={openModal}
      >
        +
      </button>
      {modalOpen ? <DepositModalPortal setModalOpen={setModalOpen} /> : null}
    </>
  );
}
