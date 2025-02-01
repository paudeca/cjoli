import styled from "@emotion/styled";
import { Popover, Button, OverlayTrigger, PopoverProps } from "react-bootstrap";
import { ArrowsCollapseVertical } from "react-bootstrap-icons";
import TeamTable from "../team/TeamTable";
import { Squad, Team } from "../../../models";
import { Trans } from "react-i18next";

const MyButton = styled(ArrowsCollapseVertical)`
  color: #bbb;
  &:hover {
    color: black;
  }
`;

interface CompareButtonProps {
  team: Team;
  teamB: Team;
  squad?: Squad;
}

const CompareButton = ({ team, teamB, squad }: CompareButtonProps) => {
  const ComparePopover = (props: PopoverProps) => (
    <Popover {...props}>
      <Popover.Header style={{ color: "black" }}>
        <Trans i18nKey="match.compare">Compare</Trans>
      </Popover.Header>
      <Popover.Body>
        <div>
          <TeamTable team={team} teamB={teamB} squad={squad} />
        </div>
        <Button onClick={() => document.body.click()} size="sm">
          <Trans i18nKey="button.close">Close</Trans>
        </Button>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      overlay={ComparePopover}
      placement="auto"
      rootClose
      trigger="click"
    >
      <div className="d-inline">
        <MyButton role="button" size={20} className="mx-2" />
      </div>
    </OverlayTrigger>
  );
};

export default CompareButton;
