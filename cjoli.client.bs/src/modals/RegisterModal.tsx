import { useTranslation } from "react-i18next";
import CJoliModal, { Field } from "../components/CJoliModal";
import { useToast } from "../hooks/useToast";
import { useUser } from "../hooks/useUser";
import { User } from "../models";
import * as cjoliService from "../services/cjoliService";

type UserRegister = User & { passwordConfirm: string };

const RegisterModal = () => {
  const { loadUser } = useUser();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const fields: Field<UserRegister>[] = [
    {
      id: "login",
      label: t("login.form.login", "Login"),
      type: "text",
      required: true,
      autoFocus: true,
    },
    {
      id: "password",
      label: t("login.form.password", "Password"),
      type: "password",
      required: true,
    },
    {
      id: "passwordConfirm",
      label: t("login.form.confirmPassword", "Confirm Password"),
      type: "password",
      required: true,
      validate: "password",
    },
  ];
  const onSubmit = async (user: UserRegister) => {
    const result = await cjoliService.register(user);
    if (!result) {
      showToast(
        "danger",
        t("login.error.register", "Unable to register account")
      );
      return false;
    } else {
      const user = await cjoliService.getUser();
      loadUser(user);
      showToast("success", t("login.success.register", "Account created"));
      return true;
    }
  };
  return (
    <CJoliModal
      id="register"
      title={t("login.title.register", "Register")}
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default RegisterModal;
