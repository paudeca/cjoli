import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ModalProps } from "../modals";
import { useUser } from "@cjoli/core";

export const UserDropdown: FC<{
  login: ModalProps;
  register: ModalProps;
}> = ({ login, register }) => {
  const { user } = useUser();
  const { t } = useTranslation();

  console.log("reg", register);
  const items: {
    id: string;
    label: ReactNode;
    className?: string;
    color?: "danger";
  }[] = user
    ? [
        {
          id: "profile",
          label: (
            <>
              Signed as <span className="font-bold">{user.login}</span>
            </>
          ),
          className: "h-14 gap-2",
        },
        { id: "update", label: t("menu.update", "Update") },
        { id: "admin", label: t("menu.admin", "Administration") },
        {
          id: "logout",
          label: "Logout",
          className: "text-danger",
          color: "danger",
        },
      ]
    : [
        { id: "login", label: t("menu.login", "Login") },
        { id: "register", label: t("menu.register", "Register") },
      ];

  return (
    <>
      <Dropdown placement="bottom">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              isBordered: true,
              classNames: {
                base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                icon: "text-primary",
              },
            }}
            className="transition-transform text-background"
            description={user?.role}
            name={user?.login}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat" items={items}>
          {(item) => (
            <DropdownItem
              key={item.id}
              onPress={login.onOpen}
              className={item.className}
              color={item.color ?? "default"}
            >
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </>
  );
};
