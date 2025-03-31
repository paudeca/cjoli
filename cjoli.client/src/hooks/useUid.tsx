import { useParams } from "react-router-dom";

const useUid = () => {
  const { uid } = useParams();

  const host = window.location.host;
  const uidDomain = host.split(".")[0];
  if (
    uidDomain &&
    uidDomain != "bdb79ab76da9" &&
    uidDomain != "www" &&
    uidDomain != "cjoli-hockey" &&
    !uidDomain.startsWith("localhost")
  ) {
    return uidDomain;
  }

  return uid!;
};

export default useUid;
