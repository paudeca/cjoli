import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ModalProps } from "../modals";
import { useUser } from "@cjoli/core";

export const UserDropdown: FC<{
  login: ModalProps;
}> = ({ login }) => {
  const { user, logout } = useUser();
  const { t } = useTranslation();

  const items: {
    id: string;
    label: ReactNode;
    className?: string;
    color?: "danger";
    onPress?: () => void;
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
        { id: "admin", label: t("menu.admin", "Administration") },
        {
          id: "logout",
          label: "Logout",
          className: "text-danger",
          color: "danger",
          onPress: logout,
        },
      ]
    : [{ id: "login", label: t("menu.login", "Login"), onPress: login.onOpen }];

  return (
    <>
      <Dropdown placement="bottom" offset={18}>
        <DropdownTrigger>
          <Avatar
            isBordered
            size="sm"
            classNames={{
              base: "bg-gradient-to-br from-[#DE8D7D] to-[#922829]",
              icon: "text-primary",
            }}
            role="button"
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat" items={items}>
          {(item) => (
            <DropdownItem
              key={item.id}
              onPress={item.onPress}
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
