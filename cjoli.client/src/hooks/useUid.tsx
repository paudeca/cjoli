import { useParams } from "react-router-dom";

const useUid = () => {
  const { uid } = useParams();

  const host = window.location.host;
  const uidDomain = host.split(".")[0];
  if (
    uidDomain &&
    uidDomain != "61c140aa187f" &&
    uidDomain != "www" &&
    uidDomain != "cjoli-hockey" &&
    uidDomain != "cjolihockey" &&
    !uidDomain.startsWith("localhost")
  ) {
    return uidDomain;
  }

  return uid!;
};

export default useUid;
