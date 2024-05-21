import React, { ReactNode } from "react";

export const ModalContext = React.createContext<{
  show: Record<string, boolean>;
  setShow: (show: Record<string, boolean>) => void;
} | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = React.useState<Record<string, boolean>>({});
  return (
    <ModalContext.Provider value={{ show, setShow }}>
      {children}
    </ModalContext.Provider>
  );
};
