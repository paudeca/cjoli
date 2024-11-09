import styled from "@emotion/styled";
import { Overlay, Popover, Button } from "react-bootstrap";
import { ArrowsCollapseVertical } from "react-bootstrap-icons";
import React from "react";
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
  const [open, setOpen] = React.useState(false);
  const target = React.useRef(null);
  return (
    <>
      <div ref={target} className="d-inline">
        <MyButton
          role="button"
          size={20}
          className="mx-2"
          onClick={() => setOpen(!open)}
        />
      </div>
      <Overlay
        target={target.current}
        show={open}
        rootClose
        onHide={() => setOpen(false)}
        placement="auto"
      >
        {(props) => (
          <Popover {...props}>
            <Popover.Header style={{ color: "black" }}>
              <Trans i18nKey="match.compare">Compare</Trans>
            </Popover.Header>
            <Popover.Body>
              <div>
                <TeamTable team={team} teamB={teamB} squad={squad} />
              </div>
              <Button onClick={() => setOpen(false)} size="sm">
                <Trans i18nKey="button.close">Close</Trans>
              </Button>
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </>
  );
};

export default CompareButton;
