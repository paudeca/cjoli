import { Badge } from "@heroui/react";

import { NavbarDefault } from "./navbar-default";
import { FC, memo } from "react";
import { Icon } from "@iconify/react";
import { CJoliLoading } from "@/components/cjoli-loading";
import { useDefaultLayout } from "@/hooks";
import { Outlet } from "react-router-dom";

const version = __APP_VERSION__;

const CountUser = memo(() => {
  const { countUser } = useDefaultLayout();
  console.log("CountUser", countUser);
  return (
    <Badge
      color="secondary"
      content={countUser}
      shape="rectangle"
      size="sm"
      variant="solid"
      placement="top-right"
      showOutline={false}
    >
      <Icon icon="carbon:user-filled" width="20" className="text-default-300" />
    </Badge>
  );
});

export const DefaultLayout: FC = memo(() => {
  const { isLoading, page } = useDefaultLayout();
  console.log("DefaultLayout");
  return (
    <CJoliLoading loading={isLoading}>
      <div className="relative flex flex-col h-screen">
        <NavbarDefault page={page} />
        <main className="container mx-auto max-w-7xl px-0 md:px-6 flex-grow pt-2 md:pt-16">
          <Outlet />
        </main>
        <footer className="w-full flex items-end justify-start p-3">
          <span className="text-xs text-default-300">{version}</span>
          <CountUser />
        </footer>
      </div>
    </CJoliLoading>
  );
});
