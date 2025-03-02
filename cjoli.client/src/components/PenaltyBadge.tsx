import styled from "@emotion/styled";
import { Fragment } from "react";
import { Badge } from "react-bootstrap";

const MyBadge = styled(Badge)`
  --bs-bg-opacity: 0.2;
  color: grey;
`;

interface PenaltyBadgeProps {
  penalty: number;
}

const PenaltyBadge = ({ penalty }: PenaltyBadgeProps) => {
  if (penalty == 0) {
    return <Fragment />;
  }
  return (
    <MyBadge pill className="ms-2 user-select-none" bg="warning">
      {penalty}P
    </MyBadge>
  );
};

export default PenaltyBadge;
