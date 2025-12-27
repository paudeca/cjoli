import { Button, Card } from "react-bootstrap";
import CJoliStack from "../components/CJoliStack";
import Loading from "../components/Loading";
import CJoliCard from "../components/CJoliCard";
import { Cart3 } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const url = import.meta.env.VITE_API_URL;

const GamePage = () => {
  return (
    <Loading ready={true}>
      <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
        <CJoliCard style={{ width: "18rem" }} className="m-5 p-2">
          <Card.Title>Buy Ticket</Card.Title>
          <Card.Subtitle>1€</Card.Subtitle>
          <Card.Text>Buy Ticket to play game</Card.Text>
          <Button
            variant="primary"
            onClick={() => {
              window.location.href = `${url}/Pay/Create`;
            }}
          >
            Checkout
            <Cart3 size={20} className="mx-2" />
          </Button>
        </CJoliCard>
      </CJoliStack>
    </Loading>
  );
};

export default GamePage;
