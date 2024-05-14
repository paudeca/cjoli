import { ReactNode } from "react";
import useScreenSize from "../../hooks/useScreenSize";

const ButtonFixed = ({ children }: { children: ReactNode }) => {
  const { isMobile } = useScreenSize();
  return (
    <div
      className={`my-3 ${isMobile ? "mx-1" : "mx-5"} position-fixed  bottom-0 ${
        isMobile ? "start-0" : "end-0"
      } z-3`}
    >
      {children}
    </div>
  );
};

export default ButtonFixed;
