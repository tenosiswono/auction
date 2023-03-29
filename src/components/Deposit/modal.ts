import { Modal, type modalBackdrop, type modalPlacement } from "flowbite";

export const modal = new Modal(document.getElementById("depositModal"), {
  placement: "center" as modalPlacement,
  backdrop: "dynamic" as modalBackdrop,
  backdropClasses:
    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
  closable: true,
});
