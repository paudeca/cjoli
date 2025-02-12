import { useParams } from "react-router-dom";
import { getUidDomain } from "../utils/domain";

export const useUid = () => {
  const { uid } = useParams();

  const uidDomain = getUidDomain();
  return uidDomain ?? uid!;
};
