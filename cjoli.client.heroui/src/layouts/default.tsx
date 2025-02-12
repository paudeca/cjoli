import { Badge } from "@heroui/react";

import { NavbarDefault } from "./navbar-default";
import { FC, ReactNode, useEffect } from "react";
import { Toaster } from "sonner";
import { useApi, useCJoli, useUid, useUser } from "@cjoli/core";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { CJoliLoading } from "@/components/cjoli-loading";

const version = __APP_VERSION__;

const DefaultLayout: FC<{ children: ReactNode; page?: "home" | "ranking" }> = ({
  children,
  page,
}) => {
  const { getUser, getTourneys } = useApi();
  const uid = useUid();
  const { selectTourney } = useCJoli();
  const { countUser } = useUser();

  useQuery(getUser());
  const { data: tourneys, isLoading } = useQuery(getTourneys({}));

  useEffect(() => {
    if (uid && tourneys) {
      selectTourney(tourneys.find((t) => t.uid === uid)!);
    }
  }, [uid, tourneys, selectTourney]);

  return (
    <CJoliLoading loading={isLoading}>
      <div className="relative flex flex-col h-screen">
        <NavbarDefault page={page} />
        <main className="container mx-auto max-w-7xl px-0 md:px-6 flex-grow pt-2 md:pt-16">
          {children}
        </main>
        <footer className="w-full flex items-end justify-start p-3">
          <span className="text-xs text-default-300">{version}</span>
          <Badge
            color="secondary"
            content={countUser}
            shape="rectangle"
            size="sm"
            variant="solid"
            placement="top-right"
            showOutline={false}
          >
            <Icon
              icon="carbon:user-filled"
              width="20"
              className="text-default-300"
            />
          </Badge>
        </footer>
        <Toaster position="top-right" />
      </div>
    </CJoliLoading>
  );
};

export default DefaultLayout;
