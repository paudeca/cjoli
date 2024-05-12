import styled from "@emotion/styled";
import { Overlay, Popover, Button } from "react-bootstrap";
import { ArrowsCollapseVertical } from "react-bootstrap-icons";
import React from "react";
import TeamTable from "../team/TeamTable";
import { Team } from "../../../models";

const MyButton = styled(ArrowsCollapseVertical)`
  color: #bbb;
  &:hover {
    color: black;
  }
`;

const CompareButton = ({ team, teamB }: { team: Team; teamB: Team }) => {
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
            <Popover.Header style={{ color: "black" }}>Compare</Popover.Header>
            <Popover.Body>
              <div>
                <TeamTable team={team} teamB={teamB} />
              </div>
              <Button onClick={() => setOpen(false)} size="sm">
                Close
              </Button>
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </>
  );
};

export default CompareButton;
