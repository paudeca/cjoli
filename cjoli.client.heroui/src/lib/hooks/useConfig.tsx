import { ConfigContext } from "@@/contexts";
import { useCallback, useContext } from "react";
import { getUidDomain } from "../utils/domain";
import { useUid } from "./useUid";

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig has to be used within <ConfigProvider>");
  }

  const uid = useUid();
  const isUseDomain = !!getUidDomain();
  const path = isUseDomain ? "/" : `/${uid}/`;

  const getPath = useCallback(
    (path: string) => (isUseDomain ? path : `/${uid}${path}`),
    [isUseDomain, uid]
  );

  return { ...ctx, path, getPath };
};
