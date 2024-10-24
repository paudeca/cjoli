import styled from "@emotion/styled";
import { Card } from "react-bootstrap";

const CJoliCard = styled(Card)`
  background-color: white;
  border: 3px solid ${(props) => props.theme.colors.secondary};
  & .card-body {
    background-color: #e7e9ee;
  }
  & .card-title {
    color: ${(props) => props.theme.colors.secondary};
  }
`;

export default CJoliCard;
