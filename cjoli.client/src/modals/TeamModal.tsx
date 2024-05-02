import CJoliModal, { Field } from "../components/CJoliModal";
import { useToast } from "../contexts/ToastContext";
import { Team } from "../models";
import * as cjoliService from "../services/cjoliService";
import useUid from "../hooks/useUid";

const TeamModal = ({ team }: { team?: Team }) => {
  const { showToast } = useToast();
  const uid = useUid();

  const fields: Field<Team>[] = [
    { id: "logo", label: "Logo", type: "text", autoFocus: true },
    { id: "youngest", label: "Youngest (date)", type: "date" },
  ];
  const onSubmit = async (team: Team) => {
    const result = await cjoliService.updateTeam(uid, team);
    if (!result) {
      showToast("danger", "Unable to update Team");
      return false;
    } else {
      return true;
    }
  };
  return (
    <CJoliModal
      id="team"
      title={`Edit ${team?.name}`}
      fields={fields}
      onSubmit={onSubmit}
      values={team}
    />
  );
};

export default TeamModal;
