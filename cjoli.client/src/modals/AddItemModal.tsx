import CJoliModal, { Field } from "../components/CJoliModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../hooks/useToast";
import { useModal } from "../hooks/useModal";

interface AddItemModalProps<T> {
  id: string;
  title: string;
  onItemTeam: (value: string, data?: T) => Promise<boolean>;
  fieldLabel?: string;
}

const AddItemModal = <T,>({
  id,
  title,
  onItemTeam,
  fieldLabel,
}: AddItemModalProps<T>) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data } = useModal<T>(id);

  const fields: Field<{ value: string }>[] = [
    {
      id: "value",
      label: fieldLabel ?? "Name",
      type: "text",
      autoFocus: true,
    },
  ];

  const onSubmit = async ({ value }: { value: string }) => {
    if (!(await onItemTeam(value, data))) {
      showToast("danger", t("team.error.add", "Unable to add item"));
      return false;
    }
    return true;
  };

  return (
    <CJoliModal id={id} title={title} fields={fields} onSubmit={onSubmit} />
  );
};

export default AddItemModal;
