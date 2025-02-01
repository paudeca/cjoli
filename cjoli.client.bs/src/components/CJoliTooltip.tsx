import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const CJoliTooltip = ({
  children,
  info,
}: {
  children: React.ReactNode;
  info: string;
}) => {
  return (
    <OverlayTrigger overlay={<Tooltip>{info}</Tooltip>}>
      <span className="user-select-none">{children}</span>
    </OverlayTrigger>
  );
};

export default CJoliTooltip;
