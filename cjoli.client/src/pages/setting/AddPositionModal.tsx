import CJoliModal, { Field } from "../../components/CJoliModal";
import { Phase, Position, Squad } from "../../models";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useCJoli } from "../../hooks/useCJoli";
import { useState } from "react";
import { useModal } from "../../hooks/useModal";

interface AddPositionModalProps {
  onAddPosition: (
    position: Position,
    { phase, squad }: { phase: Phase; squad: Squad }
  ) => Promise<boolean>;
}

const AddPositionModal = ({ onAddPosition }: AddPositionModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { tourney } = useCJoli();
  const { data } = useModal<{ phase: Phase; squad: Squad }>("addPosition");

  const [phaseParent, setPhaseParent] = useState<Phase>();
  const [squadParent, setSquadParent] = useState<Squad>();

  const optionPositions = squadParent
    ? squadParent.positions.map((p) => ({
        label: p.value.toString(),
        value: p.value,
      }))
    : (phaseParent?.squads ?? [])
        .reduce<Position[]>((acc, s) => [...acc, ...s.positions], [])
        .map((_p, i) => ({ label: (i + 1).toString(), value: i + 1 }));

  const fields: Field<Position>[] = [
    {
      id: "value",
      label: "Value",
      type: "number",
    },
    {
      id: "name",
      label: "Position Name",
      type: "text",
      autoFocus: true,
      testId: "positionName",
    },
    {
      id: "short",
      label: "Short",
      type: "text",
    },
    {
      id: "teamId",
      label: "Team",
      type: "select",
      options: tourney?.teams.map((t) => ({ label: t.name, value: t.id })),
      testId: "teamPosition",
    },
    {
      id: "parentPosition.phaseId",
      label: "Parent Phase",
      type: "select",
      options: tourney?.phases
        .filter((p) => p.id != data?.phase.id)
        .map((p) => ({ label: p.name, value: p.id })),
      onChange: (value?: string) =>
        setPhaseParent(tourney?.phases.find((p) => p.id.toString() == value)),
    },
    {
      id: "parentPosition.squadId",
      label: "Parent Squad",
      type: "select",
      options: phaseParent?.squads.map((s) => ({ label: s.name, value: s.id })),
      onChange: (value?: string) =>
        setSquadParent(
          phaseParent?.squads.find((s) => s.id.toString() == value)
        ),
    },
    {
      id: "parentPosition.value",
      label: "Parent Position",
      type: "select",
      options: optionPositions,
    },
  ];

  const onSubmit = async (position: Position) => {
    if (!data) {
      return false;
    }
    if (!(await onAddPosition(position, data))) {
      showToast("danger", t("team.error.add", "Unable to add Position"));
      return false;
    }
    return true;
  };

  return (
    <CJoliModal
      id="addPosition"
      title={`Add Position in ${data?.squad.name} in ${data?.phase.name}`}
      fields={fields}
      onSubmit={onSubmit}
      values={{ value: data ? data.squad.positions.length + 1 : 1 }}
    />
  );
};

export default AddPositionModal;
