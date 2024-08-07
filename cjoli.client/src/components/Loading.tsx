import React, { ReactNode, useRef } from "react";
import { Container, ProgressBar } from "react-bootstrap";

const Waiting = ({
  ready,
  children,
}: {
  ready: boolean;
  children: ReactNode;
}) => {
  const [random, setRandom] = React.useState([40, 20, 60, 80]);

  const refreshIdle = useRef<number>(0);
  React.useEffect(() => {
    refreshIdle.current = window.setInterval(() => {
      setRandom([
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
      ]);
    }, 1000);
  }, []);
  if (ready) {
    clearInterval(refreshIdle.current);
  }

  return (
    <>
      {!ready && (
        <Container className="py-4" fluid>
          <ProgressBar variant="success" now={random[0]} />
          <ProgressBar variant="info" now={random[1]} />
          <ProgressBar variant="warning" now={random[2]} />
          <ProgressBar variant="danger" now={random[3]} />
        </Container>
      )}
      {ready && children}
    </>
  );
};

export default Waiting;
