import React from "react";
import { Spinner } from "react-bootstrap";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

interface ScoreButtonProps {
  id: string;
  action: "remove" | "save";
  onClick: () => Promise<void>;
}

const ScoreButton = ({ id, action, onClick }: ScoreButtonProps) => {
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
          data-testid={id}
        />
      )}
      {action == "remove" && !loading && (
        <XCircle
          color="rgb(220, 53, 69)"
          size={32}
          role="button"
          onClick={handleClick}
          data-testid={id}
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
