import CJoliModal from "../components/CJoliModal";
import { User } from "../models/User";

const LoginModal = ({ id }: { id: string }) => {
  const fields = [
    { id: "login", label: "Login", type: "text", required: true },
    { id: "password", label: "Password", type: "password", required: true },
  ];
  return <CJoliModal<User> id={id} title='Login' fields={fields} />;
};

export default LoginModal;
