import Select, { SingleValue } from "react-select";
import { Team } from "../models";
import { ReactNode, useCallback } from "react";
import TeamName from "./TeamName";

interface TeamSelectProps {
  value?: number;
  teams: Team[];
  onChangeTeam: (team?: Team) => void;
  placeholder?: string;
}
const TeamSelect = ({
  value,
  teams,
  onChangeTeam,
  placeholder,
}: TeamSelectProps) => {
  const onChange = useCallback(
    (v: SingleValue<{ label: ReactNode; value: number }>) => {
      const value = v?.value;
      if (value) {
        onChangeTeam(teams.find((t) => t.id == value));
      } else {
        onChangeTeam(undefined);
      }
    },
    [teams, onChangeTeam]
  );
  const names: Record<number, string> = teams.reduce(
    (acc, t) => ({ ...acc, [t.id]: t.name }),
    {}
  );
  const options = teams.map((t) => ({
    value: t.id,
    label: <TeamName team={t} hideFavorite />,
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
      placeholder={placeholder}
    />
  );
};

export default TeamSelect;
