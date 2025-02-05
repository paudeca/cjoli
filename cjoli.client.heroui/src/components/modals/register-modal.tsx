import { Link } from "@heroui/react";
import { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { User, useUser } from "@cjoli/core";
import { Field, ModalProps } from ".";
import { FormModal } from "./form-modal";
import { useToast } from "@/hooks/use-toast";

export const RegisterModal: FC<ModalProps & { loginOpen: () => void }> = ({
  loginOpen,
  ...modal
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { register } = useUser();

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
    const result = await register(user);
    if (!result) {
      toast("error", t("login.error.register", "Unable to register account"));
    } else {
      toast("success", t("login.success.register", "Account created"));
    }
    return result;
  };

  return (
    <FormModal
      {...modal}
      title={t("login.title.register", "Register")}
      fields={fields}
      onSubmit={onSubmit}
      footer={
        <p className="text-center text-small">
          <Link
            role="button"
            onPress={() => {
              modal.onClose();
              loginOpen();
            }}
            size="sm"
          >
            <Trans i18nKey="login.form.alreadyAccount">
              Already have an account? Log In
            </Trans>
          </Link>
        </p>
      }
    />
  );
};
