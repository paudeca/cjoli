import useScreenSize from "../../../hooks/useScreenSize";
import { IMatch, Match } from "../../../models";
import { useCJoli } from "../../../hooks/useCJoli";
import { useUser } from "../../../hooks/useUser";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { MatchRowProvider } from "./MatchRowContext";
import MatchRowDesk from "./MatchRowDesk";
import MatchRowMobile from "./MatchRowMobile";
import styled from "@emotion/styled";

export const MyScoreDiv = styled("div")<{ isMobile: boolean }>`
  display: flex;
  align-items: ${(props) => (props.isMobile ? "flex-end" : "center")};
  justify-content: center;
  flex-direction: ${(props) => (props.isMobile ? "column" : "row")};
  & svg,
  & .spinner-grow {
    ${(props) =>
      props.isMobile
        ? "margin-topp: 0.5rem !important;"
        : "margin-lefpt: 0.5rem !important;"}
  }
`;

export interface MatchRowProps extends JSX.IntrinsicAttributes {
  match: Match;
  rowSpan: number;
  index: number;
  saveMatch: (match: Match) => Promise<void>;
  updateMatch: (match: Match) => Promise<void>;
  clearMatch: (match: Match) => Promise<void>;
  register: UseFormRegister<FieldValues>;
}

const MatchRow = ({
  match,
  rowSpan,
  index,
  saveMatch,
  updateMatch,
  clearMatch,
  register,
}: MatchRowProps) => {
  const { findTeam } = useCJoli();
  const { isMobile } = useScreenSize();
  const { isAdmin, userConfig } = useUser();

  const hasUserMatch =
    match.userMatch && (!isAdmin || (isAdmin && userConfig.useCustomEstimate));
  const imatch: IMatch = match.done
    ? match
    : match.userMatch && hasUserMatch
      ? match.userMatch
      : match;
  const done = hasUserMatch || match.done;
  const isSimulation = !!hasUserMatch;
  const teamA = findTeam({ positionId: match.positionIdA });
  const teamB = findTeam({ positionId: match.positionIdB });

  return (
    <MatchRowProvider
      match={match}
      imatch={imatch}
      saveMatch={saveMatch}
      updateMatch={updateMatch}
      clearMatch={clearMatch}
      register={register}
      teamA={teamA}
      teamB={teamB}
      done={done}
      isSimulation={isSimulation}
    >
      {isMobile && <MatchRowMobile />}
      {!isMobile && <MatchRowDesk index={index} rowSpan={rowSpan} />}
    </MatchRowProvider>
  );
};

export default MatchRow;
