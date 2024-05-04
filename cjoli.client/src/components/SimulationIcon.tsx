import React from "react";
import {
  OverlayTrigger,
  Tooltip,
  Badge,
  Popover,
  Button,
  Overlay,
} from "react-bootstrap";
import { Alt, Trash } from "react-bootstrap-icons";
import ButtonLoading from "./ButtonLoading";

interface SimulationIconProps {
  show: boolean;
  title?: string;
  onRemove?: () => Promise<void>;
}

const SimulationIcon = ({ show, title, onRemove }: SimulationIconProps) => {
  const [open, setOpen] = React.useState(false);
  const target = React.useRef(null);
  const handleRemove = async () => {
    if (onRemove) {
      await onRemove();
      setOpen(false);
    }
  };
  return (
    <>
      {show && !onRemove && (
        <OverlayTrigger overlay={<Tooltip>Simulation</Tooltip>}>
          <Badge className="mx-2" bg="secondary">
            <Alt />
          </Badge>
        </OverlayTrigger>
      )}
      {show && onRemove && (
        <>
          <Badge
            className="mx-2"
            bg="secondary"
            role="button"
            ref={target}
            onClick={() => setOpen(!open)}
          >
            <Alt />
          </Badge>
          <Overlay target={target.current} show={open}>
            {(props) => (
              <Popover {...props}>
                <Popover.Header style={{ color: "black" }}>
                  {title ?? "Simulation"}
                </Popover.Header>
                <Popover.Body>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: 30,
                    }}
                  >
                    Remove all simulations
                    <ButtonLoading variant="danger" onClick={handleRemove}>
                      <Trash />
                    </ButtonLoading>
                  </div>
                  <Button onClick={() => setOpen(false)} size="sm">
                    Close
                  </Button>
                </Popover.Body>
              </Popover>
            )}
          </Overlay>
        </>
      )}
    </>
  );
};

export default SimulationIcon;
