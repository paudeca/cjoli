import CJoliModal, { Field } from "../components/CJoliModal";
import { Team } from "../models";
import useUid from "../hooks/useUid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import { useSetting } from "../hooks/useSetting";

const ReplaceTeamModal = ({ team }: { team?: Team }) => {
  const uid = useUid();

  const { tourney } = useSetting();
  const { getTeams, replaceTeam } = useApi();

  const { data: teams } = useQuery(getTeams());
  const { mutateAsync: doReplaceTeam } = useMutation(replaceTeam(uid));

  const teamsFilter = tourney.teams?.map((t) => t.id);
  const fields: Field<{ teamId: number }>[] = [
    {
      id: "teamId",
      label: "Name Team",
      type: "select",
      creatable: false,
      options: teams
        .filter((t) => !teamsFilter.includes(t.id))
        .map((t) => ({ label: t.name, value: t.id })),
      autoFocus: false,
    },
  ];

  const onSubmit = async ({ teamId }: { teamId: number }) => {
    doReplaceTeam({ team: team!, newTeam: teams.find((t) => t.id == teamId)! });
    return true;
  };
  return (
    <CJoliModal
      id="replaceTeam"
      title={`Replace ${team?.name}`}
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default ReplaceTeamModal;
