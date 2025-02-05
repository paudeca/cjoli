import { useCallback, useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import { User, UserConfig } from "@/models";
import { useCJoli } from "./useCJoli";
import { UserActions } from "@/actions";
import { useService } from "./useService";
import { useUid } from "./useUid";

export const useUser = () => {
  const ctx = useContext(UserContext);
  const { loadRanking } = useCJoli();
  const uid = useUid();
  const service = useService();
  if (!ctx) {
    throw new Error("useUser has to be used within <UserProvider>");
  }

  const { state, dispatch } = ctx;

  const loadUser = useCallback(
    (user?: User) => dispatch({ type: UserActions.LOAD_USER, payload: user }),
    [dispatch]
  );

  const login = useCallback(
    async (user: User) => {
      const result = await service.login(user);
      if (result) {
        user = await service.getUser();
        loadUser(user);
        if (uid) {
          const ranking = await service.getRanking(uid);
          loadRanking(ranking);
        }
      }
      return result;
    },
    [loadRanking, loadUser, service, uid]
  );

  const register = useCallback(
    async (user: User) => {
      const result = await service.register(user);
      if (result) {
        const user = await service.getUser();
        loadUser(user);
      }
      return result;
    },
    [loadUser, service]
  );

  const setCountUser = useCallback(
    (count: number) =>
      dispatch({ type: UserActions.COUNT_USER, payload: count }),
    [dispatch]
  );

  const handleSaveUserConfig = useCallback(
    async (userConfig: UserConfig) => {
      try {
        const ranking = await service.saveUserConfig(uid, userConfig);
        loadRanking(ranking);
        const configs =
          state.user?.configs?.map((c) =>
            c.tourneyId == userConfig.tourneyId ? userConfig : c
          ) || [];
        loadUser({ ...state.user, configs } as User);
      } catch (error) {
        console.error("Unable to save userConfig", error);
      }
    },
    [loadRanking, loadUser, uid, state.user, service]
  );

  const { tourney } = useCJoli();

  const findConfig = (user?: User) => {
    return (
      user?.configs?.find((c) => c.tourneyId == tourney?.id) || {
        tourneyId: 0,
        useCustomEstimate: false,
        favoriteTeamId: 0,
        isAdmin: false,
      }
    );
  };

  const userConfig = findConfig(state.user);
  const isRootAdmin = state.user?.role === "ADMIN";

  return {
    ...state,
    isConnected: state.user,
    isRootAdmin,
    isAdmin: isRootAdmin || userConfig.isAdmin,
    login,
    register,
    findConfig,
    userConfig,
    loadUser,
    setCountUser,
    handleSaveUserConfig,
  };
};
