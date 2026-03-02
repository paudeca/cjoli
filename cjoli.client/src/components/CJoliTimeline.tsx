import styled from "@emotion/styled";
import { ReactNode } from "react";

const Main = styled("div")`
  position: relative;
  &::after {
    content: "";
    position: absolute;
    width: 3px;
    background-color: ${(props) => props.theme.colors.primary};
    top: 0;
    bottom: 0;
    left: 50%;
    margin-left: -3px;
  }
  @media screen and (max-width: 600px) {
    &::after {
      left: 0px;
    }
  }
`;

const CJoliTimeline = ({ children }: { children: ReactNode }) => {
  return <Main>{children}</Main>;
};

export default CJoliTimeline;
