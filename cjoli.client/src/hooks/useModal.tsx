import React from "react";
import { ModalContext } from "../contexts/ModalContext";

export const useModal = (id: string) => {
  const ctx = React.useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal has to be used within <ModalProvider>");
  }
  return {
    show: ctx.show[id],
    setShow: (show: boolean) => ctx.setShow({ ...ctx.show, [id]: show }),
  };
};
