import CJoliModal, { Field } from "../../components/CJoliModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";

interface AddItemModalProps {
  id: string;
  title: string;
  onItemTeam: (name: string) => Promise<boolean>;
}

const AddItemModal = ({ id, title, onItemTeam }: AddItemModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const fields: Field<{ name: string }>[] = [
    {
      id: "name",
      label: "Name",
      type: "text",
      autoFocus: true,
    },
  ];

  const onSubmit = async ({ name }: { name: string }) => {
    if (!(await onItemTeam(name))) {
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
