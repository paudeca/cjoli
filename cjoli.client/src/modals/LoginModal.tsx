import { useTranslation } from "react-i18next";
import CJoliModal, { Field } from "../components/CJoliModal";
import { useCJoli } from "../hooks/useCJoli";
import { useToast } from "../hooks/useToast";
import useUid from "../hooks/useUid";
import { useUser } from "../hooks/useUser";
import { User } from "../models";
import * as cjoliService from "../services/cjoliService";
import { memo } from "react";

const LoginModal = () => {
  const { loadRanking } = useCJoli();
  const { loadUser } = useUser();
  const { showToast } = useToast();
  const uid = useUid();
  const { t } = useTranslation();

  const fields: Field<User>[] = [
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
  ];
  const onSubmit = async (user: User) => {
    const result = await cjoliService.login(user);
    if (!result) {
      showToast("danger", t("login.error.invalidLogin", "Invalid login"));
      return false;
    } else {
      user = await cjoliService.getUser();
      loadUser(user);
      if (uid) {
        const ranking = await cjoliService.getRanking(uid);
        loadRanking(ranking);
      }
      return true;
    }
  };
  return (
    <CJoliModal<User>
      id="login"
      title={t("login.title.login", "Login")}
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export const LoginModalMemo = memo(LoginModal);

export default LoginModalMemo;
