import React from "react";
import { ModalContext } from "../contexts/ModalContext";

export const useModal = <T,>(id: string) => {
  const ctx = React.useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal has to be used within <ModalProvider>");
  }
  const setShow = (show: boolean) => ctx.setShow({ ...ctx.show, [id]: show });
  const setShowWithData = (show: boolean, data: T) => {
    ctx.setData({ ...ctx.data, [id]: data as object });
    setShow(show);
  };
  return {
    show: ctx.show[id],
    data: (ctx.data[id] || undefined) as T | undefined,
    setShow,
    setShowWithData,
  };
};

export const useModals = () => {
  const ctx = React.useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal has to be used within <ModalProvider>");
  }
  return {
    setShow: (id: string, show: boolean) =>
      ctx.setShow({ ...ctx.show, [id]: show }),
  };
};
