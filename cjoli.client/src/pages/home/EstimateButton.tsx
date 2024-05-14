import { Button, Spinner } from "react-bootstrap";
import { Bezier2 } from "react-bootstrap-icons";
import { useEstimate } from "../../hooks/useEstimate";

const EstimateButton = () => {
  const { loading, handleUpdateEstimate } = useEstimate();
  return (
    <Button onClick={handleUpdateEstimate} disabled={loading}>
      {!loading && <Bezier2 className="mx-1" />}
      {loading && <Spinner animation="grow" className="mx-1" size="sm" />}
    </Button>
  );
};

export default EstimateButton;
