import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link,
  Badge,
  useDisclosure,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { Icon } from "@iconify/react";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { useHeader, useUser } from "@cjoli/core";
import { LangDropdown } from "./dropdowns/lang-dropdown";
import { Trans } from "react-i18next";
import { LoginModal, RegisterModal } from "./modals";
import { UserDropdown } from "./dropdowns/user-dropdown";

const version = __APP_VERSION__;

export const Navbar = () => {
  const { getLabel, countUser } = useHeader();
  const { isConnected } = useUser();
  const login = useDisclosure();
  const register = useDisclosure();

  const label = getLabel(version);

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="bg-primary text-primary"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
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

        <Badge
          color="secondary"
          content={countUser}
          shape="rectangle"
          size="sm"
          variant="solid"
          placement="bottom-right"
          showOutline={false}
        >
          <Icon
            icon="carbon:user-filled"
            width="20"
            className="text-default-300"
          />
        </Badge>

        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href} isActive={item.label == "Home"}>
              <Link
                className={clsx(
                  linkStyles({ color: "primary" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium text-primary-foreground"
                )}
                color="primary"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <LangDropdown />
          {/*<ThemeSwitch />*/}
        </NavbarItem>
        {isConnected && (
          <div className="flex items-center gap-4">
            <UserDropdown login={login} register={register} />
          </div>
        )}
        {!isConnected && (
          <>
            <NavbarMenuItem className="hidden sm:flex gap-2">
              <Button
                fullWidth
                as={Link}
                variant="faded"
                onPress={login.onOpen}
              >
                <Trans i18nKey="menu.login">Login</Trans>
              </Button>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                endContent={<Icon icon="solar:alt-arrow-right-linear" />}
                fullWidth
                variant="faded"
                onPress={register.onOpen}
              >
                <Trans i18nKey="menu.register">Register</Trans>
              </Button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <LangDropdown />
        <div className="flex items-center gap-4">
          <UserDropdown login={login} register={register} />
        </div>
        {/*<ThemeSwitch />*/}
        <NavbarMenuToggle className="text-background" />
      </NavbarContent>

      <NavbarMenu>
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
        <NavbarMenuItem className="mb-4">
          <Button
            fullWidth
            as={Link}
            className="bg-foreground text-background"
            onPress={register.onOpen}
          >
            <Trans i18nKey="menu.register">Register</Trans>
          </Button>
        </NavbarMenuItem>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
      <LoginModal {...login} registerOpen={register.onOpen} />
      <RegisterModal {...register} loginOpen={login.onOpen} />
    </HeroUINavbar>
  );
};
