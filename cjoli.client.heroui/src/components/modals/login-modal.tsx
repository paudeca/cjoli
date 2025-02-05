import { Link } from "@heroui/react";
import { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { User, useUser } from "@cjoli/core";
import { Field, ModalProps } from ".";
import { FormModal } from "./form-modal";
import { useToast } from "@/hooks/use-toast";

export const LoginModal: FC<ModalProps & { registerOpen: () => void }> = ({
  registerOpen,
  ...modal
}) => {
  const { t } = useTranslation();
  const { login } = useUser();
  const { toast } = useToast();

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
    const result = await login(user);
    if (!result) {
      toast("error", t("login.error.invalidLogin", "Invalid login"));
    }
    return result;
  };

  return (
    <FormModal
      {...modal}
      title={t("login.title.login", "Login")}
      fields={fields}
      onSubmit={onSubmit}
      footer={
        <p className="text-center text-small">
          <Link
            role="button"
            onPress={() => {
              modal.onClose();
              registerOpen();
            }}
            size="sm"
          >
            <Trans i18nKey="login.form.createAccount">Create an account</Trans>
          </Link>
        </p>
      }
    />
  );
};
