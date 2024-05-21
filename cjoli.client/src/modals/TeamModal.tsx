import CJoliModal, { Field } from "../components/CJoliModal";
import { Team } from "../models";
import * as cjoliService from "../services/cjoliService";
import useUid from "../hooks/useUid";
import { useCJoli } from "../hooks/useCJoli";
import { useToast } from "../hooks/useToast";

const TeamModal = ({ team }: { team?: Team }) => {
  const { loadRanking } = useCJoli();
  const { showToast } = useToast();
  const uid = useUid();

  const fields: Field<Team>[] = [
    { id: "logo", label: "Logo", type: "text", autoFocus: true },
    { id: "youngest", label: "Youngest (date)", type: "date" },
  ];
  const onSubmit = async (team: Team) => {
    const ranking = await cjoliService.updateTeam(uid, team);
    if (!ranking) {
      showToast("danger", "Unable to update Team");
      return false;
    } else {
      loadRanking(ranking);
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
