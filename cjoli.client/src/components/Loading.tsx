import styled from "@emotion/styled";
import { ReactNode } from "react";
import { Container } from "react-bootstrap";

export const MyProgressBar = styled("div")`
  height: 4px;
  width: 100%;
  --c: no-repeat linear-gradient(#6100ee 0 0);
  background: var(--c), var(--c), #d7b8fc;
  background-size: 60% 100%;
  animation: l16 3s infinite;
  @keyframes l16 {
    0% {
      background-position:
        -150% 0,
        -150% 0;
    }
    66% {
      background-position:
        250% 0,
        -150% 0;
    }
    100% {
      background-position:
        250% 0,
        250% 0;
    }
  }
`;

const Loading = ({
  ready,
  children,
}: {
  ready: boolean;
  children: ReactNode;
}) => {
  return (
    <>
      {!ready && (
        <Container className="p-4" fluid>
          <MyProgressBar />
        </Container>
      )}
      {ready && children}
    </>
  );
};

export default Loading;
