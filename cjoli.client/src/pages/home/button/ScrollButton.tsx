import { ReactNode, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { scroller, scrollSpy } from "react-scroll";
import useScreenSize from "../../../hooks/useScreenSize";

interface ScrollButtonProps {
  to: string;
  icon: ReactNode;
  down: boolean;
}
const ScrollButton = ({ to, icon, down }: ScrollButtonProps) => {
  const [show, setShow] = useState(true);
  const { isMobile } = useScreenSize();
  useEffect(() => {
    scrollSpy.mount(document);
    scrollSpy.addSpyHandler((_x: number, y: number) => {
      const c = scroller.get(to);
      const maxy = Math.round(
        c ? c.getBoundingClientRect().top + window.scrollY : 0
      );
      setShow(down ? y <= maxy : y > maxy);
    }, document);

    return () => {
      scrollSpy.unmount(null, null);
    };
  }, [to, down]);
  return (
    <>
      {show && (
        <>
          <Button
            onClick={() => scroller.scrollTo(to, {})}
            role="button"
            data-testid="scroll"
            variant={isMobile ? "primary" : "light"}
          >
            {icon}
          </Button>
        </>
      )}
    </>
  );
};

export default ScrollButton;
