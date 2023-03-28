import React from "react";
import DepositModalPortal from "./DepositModal";


export default function DepositButton() {
  const openModal = async() => {
    await import('./modal').then(m => m.modal.show())
  }
  return (
    <>
      <button
        className="btn-primary ml-2 h-6 w-6 rounded-full p-0"
        onClick={openModal}
      >
        +
      </button>
      <DepositModalPortal />
    </>
  );
}
