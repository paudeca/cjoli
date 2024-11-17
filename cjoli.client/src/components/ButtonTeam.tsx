import styled from "@emotion/styled";
import { CaretRight } from "react-bootstrap-icons";

import { zoomIcon } from "../styles";
import { useNavigate } from "react-router-dom";
import { useServer } from "../hooks/useServer";
import { Team } from "../models";

const MyCaretRight = styled(CaretRight)`
  ${zoomIcon}
`;

interface ButtonTeamProps {
  team: Team;
}

const ButtonTeam = ({ team }: ButtonTeamProps) => {
  const navigate = useNavigate();
  const { path } = useServer();

  return (
    <MyCaretRight
      role="button"
      className="mx-2"
      onClick={() => {
        navigate(`${path}team/${team.id}`);
        window.scrollTo(0, 0);
      }}
    />
  );
};

export default ButtonTeam;
