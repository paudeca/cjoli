import Select, { SingleValue } from "react-select";
import { Team } from "../models";
import { ReactNode, useCallback } from "react";
import { useCJoli } from "../hooks/useCJoli";
import TeamName from "./TeamName";

interface TeamSelectProps {
  value?: number;
  teams: Team[];
  onChangeTeam: (team?: Team) => void;
}
const TeamSelect = ({ value, teams, onChangeTeam }: TeamSelectProps) => {
  const { getTeam } = useCJoli();
  const onChange = useCallback(
    (v: SingleValue<{ label: ReactNode; value: number }>) => {
      const value = v?.value;
      if (value) {
        onChangeTeam(getTeam(value));
      } else {
        onChangeTeam(undefined);
      }
    },
    [getTeam, onChangeTeam]
  );
  const names: Record<number, string> = teams.reduce(
    (acc, t) => ({ ...acc, [t.id]: t.name }),
    {}
  );
  const options = teams.map((t) => ({
    value: t.id,
    label: <TeamName teamId={t.id} hideFavorite />,
  }));

  return (
    <Select
      options={options}
      onChange={onChange}
      value={options.find((t) => t.value == value)}
      filterOption={(option, search) => {
        return names[option.data.value]
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase());
      }}
      isClearable
    />
  );
};

export default TeamSelect;
