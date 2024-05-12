import React from "react";
import { Spinner } from "react-bootstrap";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

const ScoreButton = ({
  action,
  onClick,
}: {
  action: "remove" | "save";
  onClick: () => Promise<void>;
}) => {
  const [loading, setLoading] = React.useState(false);
  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };
  return (
    <>
      {action == "save" && !loading && (
        <CheckCircle
          color="rgb(25, 135, 84)"
          size={32}
          role="button"
          onClick={handleClick}
        />
      )}
      {action == "remove" && !loading && (
        <XCircle
          color="rgb(220, 53, 69)"
          size={32}
          role="button"
          onClick={handleClick}
        />
      )}
      {loading && (
        <Spinner
          animation="grow"
          variant={action == "remove" ? "danger" : "success"}
        />
      )}
    </>
  );
};

export default ScoreButton;
