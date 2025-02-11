import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link,
  useDisclosure,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { Icon } from "@iconify/react";

import { Logo } from "@/components/icons";
import { useHeader, useServer, useUid, useUser } from "@cjoli/core";
import { LangDropdown, UserDropdown } from "@/components/dropdowns";
import { Trans, useTranslation } from "react-i18next";
import { LoginModal } from "@/components/modals";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

export const NavbarDefault: FC<{ page?: "home" | "ranking" }> = ({ page }) => {
  const { getLabel } = useHeader();
  const { isConnected } = useUser();
  const login = useDisclosure();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getPath } = useServer();
  const uid = useUid();

  const label = getLabel();

  const navs = uid
    ? [
        { id: "home", label: t("menu.home", "Home"), path: "/" },
        {
          id: "ranking",
          label: t("menu.ranking", "Ranking"),
          path: "/ranking",
        },
      ]
    : [];

  return (
    <Navbar
      maxWidth="xl"
      position="sticky"
      className="bg-primary text-primary"
      shouldHideOnScroll
    >
      <NavbarMenuToggle className="text-background lg:hidden" />

      <NavbarBrand className="gap-3 max-w-fit">
        <Link
          className="flex justify-start items-center gap-1"
          href="/"
          color="primary"
        >
          <Logo />
          <p className="font-bold text-primary-foreground hidden sm:flex">
            CJOLI
          </p>
          <p className="text-primary-foreground hidden sm:flex">
            {label.large}
          </p>
          <p className="text-primary-foreground sm:hidden">{label.small}</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {navs.map((n) => (
            <NavbarItem key={n.id} isActive={page == n.id}>
              <Link
                className={clsx(
                  linkStyles({ color: "primary" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium text-primary-foreground"
                )}
                color="primary"
                onPress={() => navigate(getPath(n.path))}
                role="button"
              >
                {n.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hiddenn sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex gap-2">
          <LangDropdown />
        </NavbarItem>
        {!isConnected && (
          <>
            <NavbarMenuItem>
              <Button
                endContent={<Icon icon="solar:alt-arrow-right-linear" />}
                fullWidth
                variant="faded"
                onPress={login.onOpen}
              >
                <Trans i18nKey="menu.login">Login</Trans>
              </Button>
            </NavbarMenuItem>
          </>
        )}
        {isConnected && (
          <div className="flex items-center gap-4">
            <UserDropdown login={login} />
          </div>
        )}
      </NavbarContent>

      <NavbarMenu className="cjoli">
        {!isConnected && (
          <NavbarMenuItem>
            <Button
              fullWidth
              as={Link}
              onPress={login.onOpen}
              className="bg-foreground text-background"
            >
              <Trans i18nKey="menu.login">Login</Trans>
            </Button>
          </NavbarMenuItem>
        )}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <LangDropdown />

          {navs.map((n) => (
            <NavbarMenuItem key={n.id} isActive={n.id == page}>
              <Link
                color="primary"
                size="lg"
                role="button"
                onPress={() => navigate(getPath(n.path))}
              >
                {n.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
      <LoginModal {...login} />
    </Navbar>
  );
};
