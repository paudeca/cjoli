import React, { ReactNode } from "react";

const ModalContext = React.createContext<{
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

// eslint-disable-next-line react-refresh/only-export-components
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
