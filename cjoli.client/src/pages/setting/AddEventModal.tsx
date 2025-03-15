import CJoliModal, { Field } from "../../components/CJoliModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useModal } from "../../hooks/useModal";
import { EventPhase, Phase } from "../../models";

interface AddEventModalProps {
  onAddEvent: (event: EventPhase, phase: Phase) => Promise<boolean>;
}

const AddEventModal = ({ onAddEvent }: AddEventModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: phase } = useModal<Phase>("addEvent");

  const fields: Field<EventPhase>[] = [
    {
      id: "name",
      label: "Name",
      type: "text",
      autoFocus: true,
    },
    {
      id: "time",
      label: "Time",
      type: "datetime-local",
    },
  ];

  const onSubmit = async (event: EventPhase) => {
    if (!phase) {
      showToast("danger", "Invalid data is undefined");
      return false;
    }
    if (!(await onAddEvent(event, phase))) {
      showToast("danger", t("team.error.add", "Unable to add item"));
      return false;
    }
    return true;
  };

  return (
    <CJoliModal
      id="addEvent"
      title="Add Event"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default AddEventModal;
