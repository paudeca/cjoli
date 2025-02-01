import React from "react";
import { ToastContext } from "../contexts/ToastContext";

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast has to be used within <ToastProvider>");
  }
  return ctx;
};
