import { Dropdown, DropdownButton, Form, InputGroup } from "react-bootstrap";
import { Match } from "../../../models";
import { useUser } from "../../../hooks/useUser";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { Trans } from "react-i18next";

interface ScoreCellProps {
  id: string;
  match: Match;
  teamA?: boolean;
  teamB?: boolean;
  saveMatch: (match: Match) => void;
  register: UseFormRegister<FieldValues>;
}

const ScoreCell = ({
  id,
  match,
  teamA,
  saveMatch,
  register,
}: ScoreCellProps) => {
  const { isConnected } = useUser();
  const placeholder = teamA
    ? match.estimate?.scoreA.toString()
    : match.estimate?.scoreB.toString();
  return (
    <InputGroup size="sm" style={{ width: "80px" }}>
      <Form.Control
        type="number"
        min="0"
        max="100"
        {...register(id)}
        placeholder={placeholder}
      />
      {isConnected && (
        <DropdownButton variant="outline-secondary" title="">
          <Dropdown.Item
            href="#"
            onClick={() =>
              saveMatch({
                ...match,
                forfeitA: !!teamA,
                forfeitB: !teamA,
                scoreA: 0,
                scoreB: 0,
              })
            }
          >
            <Trans i18nKey="match.forfeit">Forfeit</Trans>
          </Dropdown.Item>
        </DropdownButton>
      )}
    </InputGroup>
  );
};

export default ScoreCell;
