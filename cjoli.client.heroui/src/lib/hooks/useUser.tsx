import { useCallback } from "react";
import { User, UserConfig } from "@@/models";
import { useCJoli } from "./useCJoli";
import { useCjoliService } from "./useServices";
import { useUid } from "./useUid";
import { useDispatch } from "react-redux";
import { useAppSelector } from ".";
import { userActions } from "@@/stores/user-slice";

export const useUser = () => {
  const { loadRanking } = useCJoli();
  const uid = useUid();
  const service = useCjoliService();

  const dispatch = useDispatch();
  const state = useAppSelector((state) => state.user);

  const loadUser = useCallback(
    (user?: User) => dispatch(userActions.loadUser(user)),
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

  const logout = useCallback(async () => {
    await service.logout();
    loadUser(undefined);
    if (uid) {
      const ranking = await service.getRanking(uid);
      loadRanking(ranking);
    }
  }, [loadRanking, loadUser, service, uid]);

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
    (count: number) => dispatch(userActions.setCountUser(count)),
    [dispatch]
  );

  const handleSaveUserConfig = useCallback(
    async (userConfig: UserConfig) => {
      try {
        const ranking = await service.saveUserConfig(uid, userConfig);
        loadRanking(ranking);
        //TODO use slice redux
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
    logout,
    register,
    findConfig,
    userConfig,
    loadUser,
    setCountUser,
    handleSaveUserConfig,
  };
};
