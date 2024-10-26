import CJoliModal, { Field } from "../../components/CJoliModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { Phase } from "../../models";

interface AddPhaseModalProps {
  onAddPhase: (phase: Phase) => Promise<boolean>;
  fieldLabel?: string;
}

const AddPhaseModal = ({ onAddPhase, fieldLabel }: AddPhaseModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const fields: Field<{ value: string }>[] = [
    {
      id: "value",
      label: fieldLabel ?? "Name",
      type: "text",
      autoFocus: true,
    },
  ];

  const onSubmit = async ({ value }: { value: string }) => {
    if (!(await onAddPhase({ id: 0, name: value, squads: [] }))) {
      showToast("danger", t("team.error.add", "Unable to add item"));
      return false;
    }
    return true;
  };

  return (
    <CJoliModal
      id="addPhase"
      title="Add Phase"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default AddPhaseModal;
