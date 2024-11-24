import CJoliModal, { Field } from "../../components/CJoliModal";
import { Match, Phase, Position, Squad } from "../../models";
import React from "react";
import { useSetting } from "../../hooks/useSetting";
import { useModal } from "../../hooks/useModal";
import dayjs from "dayjs";
import { useToast } from "../../hooks/useToast";

interface AddMatchModalProps {
  onAddMatch: (
    match: Match,
    { phase, squad }: { phase: Phase; squad: Squad }
  ) => Promise<boolean>;
}

const AddMatchModal = ({ onAddMatch }: AddMatchModalProps) => {
  const { tourney } = useSetting();
  const { showToast } = useToast();
  const { data } = useModal<{ phase: Phase; squad: Squad }>("addMatch");

  const getLabel = React.useCallback(
    (position: Position) => {
      return position.teamId > 0
        ? tourney.teams.find((t) => t.id == position.teamId)?.name || "noname"
        : position.name ?? position.value.toString();
    },
    [tourney]
  );

  const onSubmit = async (match: Match) => {
    if (!data) {
      return false;
    }
    if (!(await onAddMatch(match, data))) {
      showToast("danger", "Unable to add Match");
      return false;
    }
    return true;
  };

  const locationOptions = data?.squad.matches
    .reduce<string[]>((acc, m) => {
      if (m.location && !acc.includes(m.location)) return [...acc, m.location];
      return acc;
    }, [])
    .map((location) => ({ label: location, value: location }));
  locationOptions?.sort((a, b) => a.label.localeCompare(b.label));

  const nextTime = data?.squad.matches[data?.squad.matches.length - 1]?.time;

  const fields: Field<Match>[] = [
    {
      id: "positionA",
      label: "PositionA",
      type: "select",
      options: data?.squad.positions.map((p) => ({
        label: getLabel(p),
        value: p.value,
      })),
      autoFocus: true,
    },
    {
      id: "positionB",
      label: "PositionB",
      type: "select",
      options: data?.squad.positions.map((p) => ({
        label: getLabel(p),
        value: p.value,
      })),
    },
    {
      id: "time",
      label: "Time",
      type: "datetime-local",
    },
    {
      id: "location",
      label: "Location",
      type: "select",
      creatable: true,
      options: locationOptions,
    },
    {
      id: "shot",
      label: "Shot",
      type: "switch",
    },
  ];

  return (
    <CJoliModal
      id="addMatch"
      title={`Add Match in ${data?.squad?.name}`}
      fields={fields}
      onSubmit={onSubmit}
      values={{
        time: dayjs(nextTime).format("YYYY-MM-DDTHH:mm:ss"),
      }}
    />
  );
};

export default AddMatchModal;
