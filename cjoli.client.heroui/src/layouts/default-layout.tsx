import { Badge } from "@heroui/react";

import { NavbarDefault } from "./navbar-default";
import { FC, memo, ReactNode, useCallback, useEffect } from "react";
import { Toaster } from "sonner";
import { Icon } from "@iconify/react";
import { CJoliLoading } from "@/components/cjoli-loading";
import { useDefaultLayout } from "@/hooks";
import useWebSocket from "react-use-websocket";
import { MessageServer } from "@/lib/models";
import { useConfig, useUid, useUser } from "@/lib/hooks";

const version = __APP_VERSION__;

const CountUser = memo(() => {
  //const { countUser } = useDefaultLayout();
  const countUser = 0;
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

const Server = memo(() => {
  console.log("Server");
  const { server } = useConfig();
  const uid = useUid();

  const { sendJsonMessage: sendMessage, lastJsonMessage: lastMessage } =
    useWebSocket<MessageServer>(`${server}/server/ws`, {
      share: true,
      shouldReconnect: () => true,
      reconnectAttempts: 100,
      reconnectInterval: (count: number) =>
        Math.min(Math.pow(2, count) * 1000, 60000), //max 60s interval
      onOpen: () => {
        if (uid) {
          sendMessage({ type: "selectTourney", uid });
        }
      },
    });

  const register = useCallback(
    (type: string, callback: (value: number) => void) => {
      console.log("Register", type, callback, lastMessage);
      if (lastMessage != null && lastMessage.type == type) {
        console.log("EXECUTE CALLBACK", type, lastMessage.value);
        callback(lastMessage.value);
      }
    },
    [lastMessage]
  );

  const { setCountUser } = useUser();

  useEffect(() => {
    register("users", (value) => {
      console.log("update user", value);
      setCountUser(value);
    });
  }, [register, setCountUser]);

  return <div>Server</div>;
});

export const DefaultLayout: FC<{
  children: ReactNode;
  page?: "home" | "ranking";
}> = memo(({ children, page }) => {
  //const { isLoading } = useDefaultLayout();
  const isLoading = false;

  return (
    <CJoliLoading loading={isLoading}>
      <div className="relative flex flex-col h-screen">
        <NavbarDefault page={page} />
        <main className="container mx-auto max-w-7xl px-0 md:px-6 flex-grow pt-2 md:pt-16">
          {children}
        </main>
        <footer className="w-full flex items-end justify-start p-3">
          <span className="text-xs text-default-300">{version}</span>
          <CountUser />
        </footer>
      </div>
      <Toaster position="top-right" />
      <Server />
    </CJoliLoading>
  );
});
