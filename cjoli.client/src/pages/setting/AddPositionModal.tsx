import CJoliModal, { Field } from "../../components/CJoliModal";
import { Phase, Position, Squad } from "../../models";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useCJoli } from "../../hooks/useCJoli";
import React from "react";

interface AddPositionModalProps {
  phase: Phase;
  onAddPosition: (position: Position) => Promise<boolean>;
}

const AddPositionModal = ({ phase, onAddPosition }: AddPositionModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { tourney } = useCJoli();

  const [phaseParent, setPhaseParent] = React.useState<Phase>();
  const [squadParent, setSquadParent] = React.useState<Squad>();

  const fields: Field<Position>[] = [
    {
      id: "value",
      label: "Value",
      type: "number",
      autoFocus: true,
    },
    {
      id: "name",
      label: "Name",
      type: "text",
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
    },
    {
      id: "parentPosition.phaseId",
      label: "Parent Phase",
      type: "select",
      options: tourney?.phases
        .filter((p) => p.id != phase.id)
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
      options: squadParent?.positions.map((p) => ({
        label: p.value.toString(),
        value: p.value,
      })),
    },
  ];

  const onSubmit = async (position: Position) => {
    if (!(await onAddPosition(position))) {
      showToast("danger", t("team.error.add", "Unable to add Position"));
      return false;
    }
    return true;
  };

  return (
    <CJoliModal
      id={`addPosition-${phase.id}`}
      title="Add Position"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default AddPositionModal;
