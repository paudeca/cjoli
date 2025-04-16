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
  Switch,
  Spinner,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { Icon } from "@iconify/react";

import { LangDropdown, UserDropdown } from "@/components/dropdowns";
import { Trans } from "react-i18next";
import { LoginModal } from "@/components/modals";
import { FC, ReactNode } from "react";
import { useNavbarDefault } from "@/hooks";
import {
  ChartBarIcon,
  HomeIcon,
  PhotoIcon,
  RectangleStackIcon,
  SettingIcon,
  StarsIcon,
  StarsSlashIcon,
} from "@/components/icons";

export const NavbarDefault: FC<{ page?: "home" | "ranking" }> = ({ page }) => {
  const {
    uid,
    label,
    navs,
    goTo,
    isConnected,
    isAdmin,
    logo,
    useCustomEstimate,
    changeCustomEstimate,
    isPendingSaveUserConfig,
  } = useNavbarDefault();
  const icons: Record<string, ReactNode> = {
    home: <HomeIcon className="size-5 me-1" />,
    ranking: <ChartBarIcon className="size-5 me-1" />,
    gallery: <PhotoIcon className="size-5 me-1" />,
    cast: <RectangleStackIcon className="size-5 me-1" />,
    setting: <SettingIcon className="size-5 me-1" />,
  };
  const login = useDisclosure();
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
          <img src={logo} width="60px" />
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
                onPress={() => goTo(n.path)}
                role="button"
              >
                {icons[n.id]}
                {n.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent className="sm:flex basis-1/5 sm:basis-full" justify="end">
        {uid && isAdmin && (
          <NavbarItem>
            <Switch
              defaultSelected
              classNames={{ label: "text-background" }}
              color="secondary"
              startContent={<StarsSlashIcon />}
              endContent={<StarsIcon />}
              isSelected={useCustomEstimate}
              onValueChange={changeCustomEstimate}
              thumbIcon={
                isPendingSaveUserConfig && (
                  <Spinner size="sm" variant="gradient" color="secondary" />
                )
              }
              disabled={isPendingSaveUserConfig}
            />
          </NavbarItem>
        )}
        <NavbarItem className="hidden lg:flex gap-2">
          <LangDropdown />
        </NavbarItem>
        {!isConnected && (
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
                onPress={() => goTo(n.path)}
              >
                {icons[n.id]}
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
