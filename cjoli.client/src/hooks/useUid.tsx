import { useLocation } from "react-router-dom";

const useUid = () => {
  const { pathname } = useLocation();
  const match = pathname.match(/\/([^/]+)\/?/);
  return match ? match[1] : "";
};

export default useUid;
