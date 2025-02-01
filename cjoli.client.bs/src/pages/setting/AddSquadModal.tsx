import CJoliModal, { Field } from "../../components/CJoliModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useModal } from "../../hooks/useModal";
import { Phase, Squad } from "../../models";

interface AddSquadModalProps {
  onAddSquad: (squad: Squad, phase: Phase) => Promise<boolean>;
  fieldLabel?: string;
}

const AddSquadModal = ({ onAddSquad, fieldLabel }: AddSquadModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: phase } = useModal<Phase>("addSquad");

  const fields: Field<{ value: string }>[] = [
    {
      id: "value",
      label: fieldLabel ?? "Squad Name",
      type: "text",
      autoFocus: true,
    },
  ];

  const onSubmit = async ({ value }: { value: string }) => {
    if (!phase) {
      showToast("danger", "Invalid data is undefined");
      return false;
    }
    if (
      !(await onAddSquad(
        { id: 0, name: value, positions: [], matches: [] },
        phase
      ))
    ) {
      showToast("danger", t("team.error.add", "Unable to add item"));
      return false;
    }
    return true;
  };

  return (
    <CJoliModal
      id="addSquad"
      title="Add Squad"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default AddSquadModal;
