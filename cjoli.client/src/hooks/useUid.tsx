import { useParams } from "react-router-dom";

const useUid = () => {
  const { uid } = useParams();
  return uid!;
};

export default useUid;
