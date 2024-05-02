import { useLocation } from "react-router-dom";

const useUid = () => {
  const { pathname } = useLocation();
  return pathname.substring(1);
};

export default useUid;
