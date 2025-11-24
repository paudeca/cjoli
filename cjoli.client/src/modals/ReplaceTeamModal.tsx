import CJoliModal, { Field } from "../components/CJoliModal";
import { Team } from "../models";
import * as cjoliService from "../services/cjoliService";
import useUid from "../hooks/useUid";
import { useCJoli } from "../hooks/useCJoli";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import { useSetting } from "../hooks/useSetting";

const ReplaceTeamModal = ({ team }: { team?: Team }) => {
  const { loadRanking } = useCJoli();
  const { showToast } = useToast();
  const uid = useUid();
  const { t } = useTranslation();

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
    /*const ranking = await cjoliService.updateTeam(uid, team);
    if (!ranking) {
      showToast("danger", t("team.error.update", "Unable to update Team"));
      return false;
    } else {
      loadRanking(ranking);
      return true;
    }*/
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
