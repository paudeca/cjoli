import React, { ReactNode } from "react";

type Type = "danger" | "success";

interface ToastState {
  show: boolean;
  type: Type;
  message: string;
}

const ToastContext = React.createContext<{
  state: ToastState;
  hideToast: () => void;
  showToast: (type: Type, message: string) => void;
} | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = React.useState<ToastState>({ show: false, type: "success", message: "" });
  const showToast = (type: Type, message: string) => {
    setState({ show: true, type, message });
  };
  const hideToast = () => {
    setState({ ...state, show: false });
  };
  return <ToastContext.Provider value={{ state, showToast, hideToast }}>{children}</ToastContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast has to be used within <ToastProvider>");
  }
  return ctx;
};
