import { Dropdown, DropdownButton, Form, InputGroup } from "react-bootstrap";
import { Match } from "../../../models";
import { useUser } from "../../../hooks/useUser";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { Trans } from "react-i18next";
import { useCJoli } from "../../../hooks/useCJoli";
import CounterInput from "../../../components/CounterInput";

interface ScoreCellInputProps {
  id: string;
  match: Match;
  teamA?: boolean;
  teamB?: boolean;
  saveMatch: (match: Match) => void;
  updateMatch: (match: Match) => void;
  register: UseFormRegister<FieldValues>;
}

const ScoreCellInput = ({
  id,
  match,
  teamA,
  saveMatch,
  updateMatch,
  register,
}: ScoreCellInputProps) => {
  const { isAdmin } = useUser();
  const { tourney } = useCJoli();
  const placeholder = teamA
    ? match.estimate?.scoreA.toString()
    : match.estimate?.scoreB.toString();
  const hasOption =
    isAdmin && (tourney?.config?.hasForfeit || tourney?.config?.hasPenalty);
  return (
    <InputGroup size="sm" style={{ width: "80px" }}>
      <Form.Control
        type="number"
        min="0"
        max="100"
        {...register(id)}
        placeholder={placeholder}
        data-testid={id}
      />
      {hasOption && (
        <DropdownButton
          variant="outline-secondary"
          title=""
          autoClose="outside"
        >
          {tourney.config.hasForfeit && (
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
              data-testid={`${id}.forfeit`}
            >
              <Trans i18nKey="match.forfeit">Forfeit</Trans>
            </Dropdown.Item>
          )}
          {tourney.config.hasPenalty && (
            <Dropdown.Item>
              <CounterInput
                count={teamA ? match.penaltyA : match.penaltyB}
                onChange={(count) =>
                  updateMatch({
                    ...match,
                    penaltyA: teamA ? count : match.penaltyA,
                    penaltyB: !teamA ? count : match.penaltyB,
                  })
                }
              />
            </Dropdown.Item>
          )}
        </DropdownButton>
      )}
    </InputGroup>
  );
};

export default ScoreCellInput;
