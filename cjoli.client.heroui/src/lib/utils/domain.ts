export const getUidDomain = () => {
  const host = window.location.host;
  const uidDomain = host.split(".")[0];
  const isUseDomain =
    uidDomain &&
    uidDomain != "www" &&
    uidDomain != "cjoli-hockey" &&
    !uidDomain.startsWith("localhost");
  return isUseDomain ? uidDomain : null;
};
