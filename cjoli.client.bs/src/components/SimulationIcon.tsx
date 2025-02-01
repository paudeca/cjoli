import {
  OverlayTrigger,
  Tooltip,
  Badge,
  Popover,
  Button,
  TooltipProps,
  PopoverProps,
} from "react-bootstrap";
import { Alt, Trash } from "react-bootstrap-icons";
import ButtonLoading from "./ButtonLoading";
import { Trans, useTranslation } from "react-i18next";

interface SimulationIconProps {
  show: boolean;
  title?: string;
  onRemove?: () => Promise<void>;
}

const SimulationIcon = ({ show, title, onRemove }: SimulationIconProps) => {
  const { t } = useTranslation();
  const handleRemove = async () => {
    if (onRemove) {
      await onRemove();
      document.body.click();
    }
  };

  const SimulationTooltip = (props: TooltipProps) => (
    <Tooltip {...props}>Simulation</Tooltip>
  );

  const SimulationPopover = (props: PopoverProps) => (
    <Popover {...props}>
      <Popover.Header style={{ color: "black" }}>
        {title ?? t("simulation.tooltip", "Simulation")}
      </Popover.Header>
      <Popover.Body>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 30,
          }}
          className="mb-3"
        >
          <Trans i18nKey="simulation.removeAll">Remove all simulations</Trans>
          <ButtonLoading variant="danger" onClick={handleRemove}>
            <Trash />
          </ButtonLoading>
        </div>
        <Button onClick={() => document.body.click()} size="sm">
          <Trans i18nKey="button.close">Close</Trans>
        </Button>
      </Popover.Body>
    </Popover>
  );

  return (
    <>
      {show && (
        <OverlayTrigger
          overlay={onRemove ? SimulationPopover : SimulationTooltip}
          rootClose
          trigger={onRemove ? "click" : "click"}
        >
          <Badge className="mx-2" bg="secondary" role="button">
            <Alt />
          </Badge>
        </OverlayTrigger>
      )}
    </>
  );
};

export default SimulationIcon;
