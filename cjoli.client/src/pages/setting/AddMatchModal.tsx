import CJoliModal, { Field } from "../../components/CJoliModal";
import { Match, Phase, Position, Squad } from "../../models";
import React from "react";
import { useSetting } from "../../hooks/useSetting";
import { useApi } from "../../hooks/useApi";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "../../hooks/useModal";
import dayjs from "dayjs";

const AddMatchModal = () => {
  const { tourney } = useSetting();
  const { saveTourney } = useApi();
  const { data } = useModal<{ phase: Phase; squad: Squad }>("addMatch");

  const getLabel = React.useCallback(
    (position: Position) => {
      return position.teamId > 0
        ? tourney.teams.find((t) => t.id == position.teamId)?.name || "noname"
        : position.name ?? position.value.toString();
    },
    [tourney]
  );

  const { mutateAsync: doSaveTourney } = useMutation(saveTourney({}));

  const onSubmit = async (match: Match) => {
    if (!data) {
      return false;
    }
    const newSquad = {
      ...data.squad,
      matches: [...data.squad.matches, match],
    };
    const squads = data.phase.squads.map((s) =>
      s.id != data.squad.id ? s : newSquad
    );
    const newPhase = { ...data.phase, squads };
    const phases = tourney.phases.map((p) =>
      p.id != data.phase!.id ? p : newPhase
    );
    await doSaveTourney({ ...tourney, phases });
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
        time: dayjs(nextTime).format("YYYY-MM-DDThh:mm:ss"),
        location: "glace A",
        shot: true,
      }}
    />
  );
};

export default AddMatchModal;
