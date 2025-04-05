import CJoliModal, { Field } from "../../components/CJoliModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useModal } from "../../hooks/useModal";
import { EventPhase, Phase } from "../../models";
import dayjs from "dayjs";

interface AddEventModalProps {
  onAddEvent: (event: EventPhase, phase: Phase) => Promise<boolean>;
}

const AddEventModal = ({ onAddEvent }: AddEventModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: phase } = useModal<Phase>("addEvent");

  const optionsTypes = [
    { value: "Info", label: "Info" },
    { value: "Resurfacing", label: "Resurfacing" },
    { value: "Lunch", label: "Lunch" },
    { value: "Friendly", label: "Friendly" },
    { value: "Competition", label: "Competition" },
  ];

  const fields: Field<EventPhase>[] = [
    {
      id: "eventType",
      label: "Type",
      type: "select",
      options: optionsTypes,
    },
    {
      id: "name",
      label: "Name",
      type: "text",
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

  const nextTime = phase?.events[phase?.events.length - 1]?.time;

  return (
    <CJoliModal
      id="addEvent"
      title="Add Event"
      fields={fields}
      onSubmit={onSubmit}
      values={{ time: dayjs(nextTime).format("YYYY-MM-DDTHH:mm:ss") }}
    />
  );
};

export default AddEventModal;
