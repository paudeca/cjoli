import { useState, useEffect, useContext } from "react";
import { CJoliContext } from "../contexts/CJoliContext";

const useScreenSize = () => {
  const ctx = useContext(CJoliContext);
  if (!ctx) {
    throw new Error("useCJoli has to be used within <CJoliProvider>");
  }
  const { state } = ctx;

  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return {
    ...screenSize,
    isMobile: screenSize.width < 1200 && state.page != "fullcast",
    isInFrame: window.self !== window.top,
  };
};

export default useScreenSize;
