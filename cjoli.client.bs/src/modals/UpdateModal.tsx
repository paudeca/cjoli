import { useTranslation } from "react-i18next";
import CJoliModal, { Field } from "../components/CJoliModal";
import { useToast } from "../hooks/useToast";
import { User } from "../models";
import * as cjoliService from "../services/cjoliService";

type UserUpdate = User & { passwordConfirm: string };

const UpdateModal = () => {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const fields: Field<UserUpdate>[] = [
    {
      id: "password",
      label: t("login.form.password", "Password"),
      type: "password",
      required: true,
      autoFocus: true,
    },
    {
      id: "passwordConfirm",
      label: t("login.form.confirmPassword", "Confirm Password"),
      type: "password",
      required: true,
      validate: "password",
    },
  ];
  const onSubmit = async (user: User) => {
    const result = await cjoliService.update(user);
    if (!result) {
      showToast("danger", t("login.error.update", "Unable to update account"));
      return false;
    } else {
      showToast("success", t("login.success.update", "Account updated"));
      return true;
    }
  };
  return (
    <CJoliModal
      id="update"
      title={t("login.title.update", "Update")}
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default UpdateModal;
