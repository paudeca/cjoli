import CJoliModal,{Field} from "../components/CJoliModal";
import { useCJoli } from "../contexts/CJoliContext";
import { useToast } from "../contexts/ToastContext";
import { User } from "../models/User";
import * as cjoliService from "../services/cjoliService";

const LoginModal = () => {
  const { loadUser } = useCJoli();
  const { showToast } = useToast();


  const fields:Field<User>[] = [
    { id: "login", label: "Login", type: "text", required: true },
    { id: "password", label: "Password", type: "password", required: true },
  ];
  const onSubmit = async (user:User)=>{
    const result = await cjoliService.login(user);
    if (!result) {
      showToast("danger", "Invalid login");
      return false;
    } else {
      user = await cjoliService.getUser();
      loadUser(user);
      return true;
    }
  }
  return <CJoliModal<User> id='login' title='Login' fields={fields} onSubmit={onSubmit}/>;
};

export default LoginModal;
