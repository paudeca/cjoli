import CJoliModal, { Field } from "../components/CJoliModal";
import { Team } from "../models";
import * as cjoliService from "../services/cjoliService";
import useUid from "../hooks/useUid";
import { useCJoli } from "../hooks/useCJoli";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";

const TeamModal = ({ team }: { team?: Team }) => {
  const { loadRanking } = useCJoli();
  const { showToast } = useToast();
  const uid = useUid();
  const { t } = useTranslation();

  const fields: Field<Team>[] = [
    {
      id: "name",
      label: t("team.form.name", "Name"),
      type: "text",
      autoFocus: true,
    },
    {
      id: "shortName",
      label: t("team.form.shortName", "Short Name"),
      type: "text",
    },
    {
      id: "fullName",
      label: t("team.form.fullName", "Full Name"),
      type: "text",
    },
    {
      id: "alias",
      label: t("team.form.alias", "Alias"),
      type: "text",
    },
    {
      id: "logo",
      label: t("team.form.logo", "Logo"),
      type: "text",
    },
    {
      id: "youngest",
      label: t("team.form.youngest", "Youngest (date)"),
      type: "date",
    },
  ];
  const onSubmit = async (team: Team) => {
    const ranking = await cjoliService.updateTeam(uid, team);
    if (!ranking) {
      showToast("danger", t("team.error.update", "Unable to update Team"));
      return false;
    } else {
      loadRanking(ranking);
      return true;
    }
  };
  return (
    <CJoliModal
      id="team"
      title={t("team.title", { team: team?.name })}
      fields={fields}
      onSubmit={onSubmit}
      values={team}
    />
  );
};

export default TeamModal;
