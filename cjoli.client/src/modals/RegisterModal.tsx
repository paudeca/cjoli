import CJoliModal, { Field } from "../components/CJoliModal";
import { useCJoli } from "../contexts/CJoliContext";
import { useToast } from "../contexts/ToastContext";
import { User } from "../models/User";
import * as cjoliService from "../services/cjoliService";

type UserRegister = User & { passwordConfirm: string };

const RegisterModal = () => {
  const { loadUser } = useCJoli();
  const { showToast } = useToast();

  const fields: Field<UserRegister>[] = [
    {
      id: "login",
      label: "Login",
      type: "text",
      required: true,
      autoFocus: true,
    },
    { id: "password", label: "Password", type: "password", required: true },
    {
      id: "passwordConfirm",
      label: "Confirm Password",
      type: "password",
      required: true,
      validate: "password",
    },
  ];
  const onSubmit = async (user: UserRegister) => {
    const result = await cjoliService.register(user);
    if (!result) {
      showToast("danger", "Unable to register account");
      return false;
    } else {
      const user = await cjoliService.getUser();
      loadUser(user);
      showToast("success", "Account created");
      return true;
    }
  };
  return (
    <CJoliModal
      id="register"
      title="Register"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default RegisterModal;
