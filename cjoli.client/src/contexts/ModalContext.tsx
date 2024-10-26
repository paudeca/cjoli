import { createContext, ReactNode, useState } from "react";

export const ModalContext = createContext<{
  show: Record<string, boolean>;
  setShow: (show: Record<string, boolean>) => void;
  data: Record<string, object>;
  setData: (data: Record<string, object>) => void;
} | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [data, setData] = useState<Record<string, object>>({});
  return (
    <ModalContext.Provider value={{ show, setShow, data, setData }}>
      {children}
    </ModalContext.Provider>
  );
};
