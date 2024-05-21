import CJoliModal, { Field } from "../components/CJoliModal";
import { useToast } from "../hooks/useToast";
import { User } from "../models";
import * as cjoliService from "../services/cjoliService";

type UserUpdate = User & { passwordConfirm: string };

const UpdateModal = () => {
  const { showToast } = useToast();

  const fields: Field<UserUpdate>[] = [
    { id: "password", label: "Password", type: "password", required: true },
    {
      id: "passwordConfirm",
      label: "Confirm Password",
      type: "password",
      required: true,
      validate: "password",
    },
  ];
  const onSubmit = async (user: User) => {
    const result = await cjoliService.update(user);
    if (!result) {
      showToast("danger", "Unable to update account");
      return false;
    } else {
      showToast("success", "Account updated");
      return true;
    }
  };
  return (
    <CJoliModal
      id="update"
      title="Update"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default UpdateModal;
