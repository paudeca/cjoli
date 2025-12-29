import {
  Badge,
  Button,
  Col,
  Form,
  OverlayTrigger,
  Popover,
  PopoverProps,
  Row,
  Tooltip,
  TooltipProps,
} from "react-bootstrap";
import { useCJoli } from "../hooks/useCJoli";
import { useForm } from "react-hook-form";
import { Position } from "../models";
import * as cjoliService from "../services/cjoliService";
import useUid from "../hooks/useUid";
import styled from "@emotion/styled";
import { useUser } from "../hooks/useUser";
import { Trans, useTranslation } from "react-i18next";

const MyBadge = styled(Badge)<{ ["data-penalty"]: boolean }>`
  --bs-bg-opacity: ${(props) => (!props["data-penalty"] ? "0.2" : "1")};
  color: ${(props) => (props["data-penalty"] ? "white" : "grey")};
`;

const PenaltyIcon = ({ positionId }: { positionId: number }) => {
  const { getPosition, loadRanking } = useCJoli();
  const uid = useUid();
  const { isAdmin } = useUser();
  const { t } = useTranslation();

  const position = getPosition(positionId)!;

  const { register, handleSubmit } = useForm<Position>({ values: position });

  const submit = async (position: Position) => {
    const ranking = await cjoliService.updatePosition(uid, position);
    loadRanking(ranking);
    document.body.click();
  };
  const hasPenalty = position.penalty != 0;

  const PenaltyTooltip = (props: TooltipProps) => (
    <Tooltip {...props}>
      {t("penalty.tooltip", { count: position.penalty })}
    </Tooltip>
  );

  const PenaltyPopover = (props: PopoverProps) => (
    <Popover {...props} body>
      <Form onSubmit={handleSubmit(submit)}>
        <Form.Group as={Row} controlId="penalty">
          <Form.Label column>
            <Trans i18nKey="penalty.label">Penalties</Trans>
          </Form.Label>
          <Col>
            <Form.Control
              type="number"
              min={-99}
              max={99}
              {...register("penalty")}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="pt-2">
          <Col sm={{ span: 10, offset: 2 }}>
            <Button size="sm" className="mx-1" type="submit">
              <Trans i18nKey="button.save">Save</Trans>
            </Button>

            <Button
              variant="outline-secondary"
              onClick={() => document.body.click()}
              size="sm"
            >
              <Trans i18nKey="button.close">Close</Trans>
            </Button>
          </Col>
        </Form.Group>
      </Form>
    </Popover>
  );

  if (!hasPenalty && !isAdmin) {
    return <></>;
  }
  return (
    <OverlayTrigger
      overlay={isAdmin ? PenaltyPopover : PenaltyTooltip}
      trigger={isAdmin ? "click" : "hover"}
      rootClose={isAdmin}
    >
      <MyBadge
        pill
        className="ms-2"
        data-penalty={hasPenalty}
        bg={
          hasPenalty ? (position.penalty > 0 ? "danger" : "success") : "warning"
        }
        role="button"
      >
        {-position.penalty}P
      </MyBadge>
    </OverlayTrigger>
  );
};

export default PenaltyIcon;
