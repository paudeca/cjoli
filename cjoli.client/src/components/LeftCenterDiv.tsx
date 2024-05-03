import styled from "@emotion/styled";

const LeftCenterDiv = styled("div")<{ isMobile: boolean; isSmall?: boolean }>`
  display: inline-flex;
  text-align: left;
  min-width: ${(props) => (props.isMobile ? "200px" : "200px")};
  align-items: center;
`;

export default LeftCenterDiv;
