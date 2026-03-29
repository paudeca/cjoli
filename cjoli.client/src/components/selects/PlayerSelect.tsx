import Select, { SingleValue } from "react-select";
import { Team } from "../../models";
import { ReactNode, useCallback } from "react";
//import TeamName from "../TeamName";
import CreatableSelect from "react-select/creatable";

interface PlayerSelectProps {
  value?: number;
  team: Team;
  //onChangeTeam: (team?: Team) => void;
  placeholder?: string;
  isClearable: boolean;
}
const PlayerSelect = ({
  value,
  team,
  placeholder,
  isClearable,
}: PlayerSelectProps) => {
  const onChange = useCallback(
    (v: SingleValue<{ label: ReactNode; value: number }>) => {
      const value = v?.value;
      /*if (value) {
        onChangeTeam(teams.find((t) => t.id == value));
      } else {
        onChangeTeam(undefined);
      }*/
    },
    //[teams, onChangeTeam],
    [],
  );
  const names: Record<number, string> = {}; /*teams.reduce(
    (acc, t) => ({ ...acc, [t.id]: t.name }),
    {},
  );*/
  const options =
    team.datas?.players.map((p) => ({
      value: p.id,
      label: `#${p.number} ${p.name}`,
    })) || [];

  return (
    <CreatableSelect
      options={options}
      onChange={onChange}
      value={options.find((t) => t.value == value)}
      filterOption={(option, search) => {
        return true;
      }}
      isClearable={isClearable}
      placeholder={placeholder}
    />
  );
};

export default PlayerSelect;
