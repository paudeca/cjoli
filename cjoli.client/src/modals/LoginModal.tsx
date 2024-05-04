import CJoliModal, { Field } from "../components/CJoliModal";
import { useToast } from "../contexts/ToastContext";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import { useUser } from "../hooks/useUser";
import { User } from "../models";
import * as cjoliService from "../services/cjoliService";

const LoginModal = () => {
  const { loadRanking } = useCJoli();
  const { loadUser } = useUser();
  const { showToast } = useToast();
  const uid = useUid();

  const fields: Field<User>[] = [
    {
      id: "login",
      label: "Login",
      type: "text",
      required: true,
      autoFocus: true,
    },
    { id: "password", label: "Password", type: "password", required: true },
  ];
  const onSubmit = async (user: User) => {
    const result = await cjoliService.login(user);
    if (!result) {
      showToast("danger", "Invalid login");
      return false;
    } else {
      user = await cjoliService.getUser();
      loadUser(user);
      if (uid) {
        const ranking = await cjoliService.getRanking(uid);
        loadRanking(ranking);
      }
      return true;
    }
  };
  return (
    <CJoliModal<User>
      id="login"
      title="Login"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default LoginModal;
