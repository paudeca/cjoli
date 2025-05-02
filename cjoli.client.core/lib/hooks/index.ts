import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../stores/store";

export * from "./useApi";
export * from "./useBootstrap";
export * from "./useCJoli";
export * from "./useConfig";
export * from "./useServices";
export * from "./useTools";
export * from "./useUid";
export * from "./useUser";

export * from "./use-pages";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
