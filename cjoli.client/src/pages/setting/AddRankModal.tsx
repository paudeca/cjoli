import CJoliModal, { Field } from "../../components/CJoliModal";
import { Phase, Rank, Squad } from "../../models";
import { useToast } from "../../hooks/useToast";
import { useCJoli } from "../../hooks/useCJoli";
import React from "react";

interface AddRankModalProps {
  onAddRank: (rank: Rank) => Promise<boolean>;
}

const AddRankModal = ({ onAddRank }: AddRankModalProps) => {
  const { showToast } = useToast();
  const { tourney } = useCJoli();

  const [phase, setPhase] = React.useState<Phase | undefined>(
    //tourney?.phases.length == 1 ? tourney?.phases[0] : undefined
    undefined,
  );
  const [squad, setSquad] = React.useState<Squad | undefined>(
    //phase?.squads.length == 1 ? phase?.squads[0] : undefined
    undefined,
  );

  console.log("SQUAD", squad);

  const fields: Field<Rank>[] = [
    {
      id: "phaseId",
      label: "Phase",
      type: "select",
      options: tourney?.phases.map((p) => ({ label: p.name, value: p.id })),
      onChange: (value?: string) => {
        setPhase(tourney?.phases.find((p) => p.id.toString() == value));
      },
    },
    {
      id: "squadId",
      label: "Squad",
      type: "select",
      options: phase?.squads.map((s) => ({ label: s.name, value: s.id })),
      onChange: (value?: string) =>
        setSquad(phase?.squads.find((s) => s.id.toString() == value)),
    },
    {
      id: "value",
      label: "Value",
      type: "select",
      options: [
        ...Array(
          squad?.isBracket ? squad?.bracketSize : squad?.positions.length,
        ).keys(),
      ].map((i) => ({
        label: (i + 1).toString(),
        value: i + 1,
      })),
    },
  ];

  const values = {
    phaseId: undefined, //tourney?.phases.length == 1 ? tourney?.phases[0].id : undefined,
    squadId: undefined, //phase?.squads.length == 1 ? phase?.squads[0].id : undefined,
  };

  const onSubmit = async (rank: Rank) => {
    if (!(await onAddRank(rank))) {
      showToast("danger", "Unable to add Rank");
      return false;
    }
    return true;
  };

  return (
    <CJoliModal
      id="addRank"
      values={values}
      title="Add Rank"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default AddRankModal;
