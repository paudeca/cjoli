import React, { ReactNode } from "react";

type Type = "danger" | "success";

interface ToastState {
  show: boolean;
  type: Type;
  message: string;
}

export const ToastContext = React.createContext<{
  state: ToastState;
  hideToast: () => void;
  showToast: (type: Type, message: string) => void;
} | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = React.useState<ToastState>({
    show: false,
    type: "success",
    message: "",
  });
  const showToast = async (type: Type, message: string) => {
    if (state.show) {
      hideToast();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    setState({ show: true, type, message });
  };
  const hideToast = () => {
    setState({ ...state, show: false });
  };
  return (
    <ToastContext.Provider value={{ state, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};
