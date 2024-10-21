import CJoliModal, { Field } from "../../components/CJoliModal";
import { Match, Position, Squad } from "../../models";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useCJoli } from "../../hooks/useCJoli";
import React from "react";

interface AddMatchModalProps {
  squad?: Squad;
  onAddMatch: (match: Match) => Promise<boolean>;
}

const AddMatchModal = ({ squad, onAddMatch }: AddMatchModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { tourney } = useCJoli();

  const getLabel = React.useCallback(
    (position: Position) => {
      return position.teamId > 0
        ? tourney!.teams.find((t) => t.id == position.teamId)!.name
        : position.name ?? position.value.toString();
    },
    [tourney]
  );

  const fields: Field<Match>[] = [
    {
      id: "positionA",
      label: "PositionA",
      type: "select",
      options: squad?.positions.map((p) => ({
        label: getLabel(p),
        value: p.value,
      })),
      autoFocus: true,
    },
    {
      id: "positionB",
      label: "PositionB",
      type: "select",
      options: squad?.positions.map((p) => ({
        label: getLabel(p),
        value: p.value,
      })),
    },
    {
      id: "time",
      label: "Time",
      type: "datetime-local",
    },
  ];

  const onSubmit = async (match: Match) => {
    if (!(await onAddMatch(match))) {
      showToast("danger", t("team.error.add", "Unable to add Match"));
      return false;
    }
    return true;
  };

  return (
    <CJoliModal
      id={`addMatch-${squad?.id}`}
      title="Add Match"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default AddMatchModal;
