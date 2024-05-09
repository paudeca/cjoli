import styled from "@emotion/styled";

const LeftCenterDiv = styled("div")<{ width?: number }>`
  display: inline-flex;
  text-align: left;
  min-width: ${(props) => (props.width ? `${props.width}px` : "200px")};
  align-items: center;
`;

export default LeftCenterDiv;
