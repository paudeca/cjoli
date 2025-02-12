import { Link, Tab, Tabs } from "@heroui/react";
import { FC, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { User, useUser } from "@cjoli/core";
import { ModalProps } from ".";
import { useToast } from "@/hooks/use-toast";
import { CJoliModal } from "../cjoli-modal";
import { CJoliForm, Field } from "../cjoli-form";
import { useForm } from "react-hook-form";

export const LoginModal: FC<ModalProps> = ({ ...modal }) => {
  const { t } = useTranslation();
  const { login, register } = useUser();
  const { toast } = useToast();
  const form = useForm<User>();
  const [selected, setSelected] = useState<string | number>("login");

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

  const onSubmitLogin = async (user: User) => {
    const result = await login(user);
    if (!result) {
      toast("error", t("login.error.invalidLogin", "Invalid login"));
    }
    return result;
  };

  const onSubmitRegister = async (user: User) => {
    const result = await register(user);
    if (!result) {
      toast("error", t("login.error.register", "Unable to register account"));
    } else {
      toast("success", t("login.success.register", "Account created"));
    }
    return result;
  };

  const bottomLink = useCallback(
    (mode: "login" | "register", label: string) => (
      <p className="text-center text-small pt-8">
        <Link role="button" onPress={() => setSelected(mode)} size="sm">
          {label}
        </Link>
      </p>
    ),
    []
  );

  return (
    <CJoliModal
      {...modal}
      onOpenChange={() => {
        form.reset();
        modal.onOpenChange();
      }}
    >
      <Tabs
        fullWidth
        size="md"
        selectedKey={selected}
        onSelectionChange={setSelected}
      >
        <Tab key="login" title={t("login.title.login", "Login")}>
          <CJoliForm
            form={form}
            fields={fields}
            onSubmit={onSubmitLogin}
            onClose={modal.onClose}
          />
          {bottomLink(
            "register",
            t("login.form.createAccount", "Need to create an account? Sign up")
          )}
        </Tab>
        <Tab key="register" title={t("login.title.register", "Register")}>
          <CJoliForm
            form={form}
            fields={fields}
            onSubmit={onSubmitRegister}
            onClose={modal.onClose}
          />
          {bottomLink(
            "login",
            t("login.form.alreadyAccount", "Already have an account? Log In")
          )}
        </Tab>
      </Tabs>
    </CJoliModal>
  );
};
