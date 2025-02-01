import React, { ReactNode } from "react";
import { Button, Spinner } from "react-bootstrap";

interface ButtonLoadingProps {
  variant?: "danger";
  children: ReactNode;
  onClick: () => Promise<void>;
}

const ButtonLoading = ({ variant, children, onClick }: ButtonLoadingProps) => {
  const [loading, setLoading] = React.useState(false);
  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };
  return (
    <span className="d-inline-flex mx-2">
      {!loading && (
        <Button variant={variant} onClick={handleClick}>
          {children}
        </Button>
      )}
      {loading && <Spinner animation="grow" variant={variant} />}
    </span>
  );
};

export default ButtonLoading;
