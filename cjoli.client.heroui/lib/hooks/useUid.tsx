import { useParams } from "react-router-dom";

export const useUid = () => {
  const { uid } = useParams();

  const host = window.location.host;
  const uidDomain = host.split(".")[0];
  if (
    uidDomain &&
    uidDomain != "www" &&
    uidDomain != "cjoli-hockey" &&
    !uidDomain.startsWith("localhost")
  ) {
    return uidDomain;
  }

  return uid!;
};
