import styled from "@emotion/styled";
import { CaretRight } from "react-bootstrap-icons";
import { animateScroll } from "react-scroll";
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
        animateScroll.scrollToTop();
      }}
    />
  );
};

export default ButtonTeam;
