import { BootstrapContext } from "@/contexts";
import { useConfig, useUser } from "@/hooks";
import { useServer } from "@/hooks/useServer";
import { useEffect } from "react";

export const BootstrapProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { server } = useConfig();
  const { register } = useServer(server);
  const { setCountUser } = useUser();

  useEffect(() => {
    register("users", (value) => {
      setCountUser(value);
    });
  }, [register, setCountUser]);

  return (
    <BootstrapContext.Provider value={null}>
      {children}
    </BootstrapContext.Provider>
  );
};
