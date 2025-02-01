import CJoliModal, { Field } from "../../components/CJoliModal";
import { Team } from "../../models";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import { useSetting } from "../../hooks/useSetting";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface AddTeamModalProps {
  onAddTeam: (team: Partial<Team>) => Promise<boolean>;
}

const AddTeamModal = ({ onAddTeam }: AddTeamModalProps) => {
  const { t } = useTranslation();
  const { tourney } = useSetting();
  const { showToast } = useToast();
  const { getTeams } = useApi();
  const navigate = useNavigate();

  const { data: teams, error } = useQuery(getTeams());
  if (
    axios.isAxiosError(error) &&
    (error.request.status == 403 || error.request.status == 401)
  ) {
    showToast("danger", t("error.notAuthorize", "User not authorized"));
    navigate("/");
  }

  const teamsFilter = tourney.teams?.map((t) => t.id);
  const fields: Field<{ nameTeam: string | number }>[] = [
    {
      id: "nameTeam",
      label: "Name Team",
      type: "select",
      creatable: true,
      options: teams
        .filter((t) => !teamsFilter.includes(t.id))
        .map((t) => ({ label: t.name, value: t.id })),
      autoFocus: false,
    },
  ];

  const onSubmit = async ({ nameTeam }: { nameTeam: string | number }) => {
    const team =
      typeof nameTeam == "number"
        ? { id: nameTeam, name: teams.find((t) => t.id == nameTeam)!.name }
        : { id: 0, name: nameTeam };
    if (!(await onAddTeam(team))) {
      showToast("danger", t("team.error.add", "Unable to add Team"));
      return false;
    }
    return true;
  };

  return (
    <CJoliModal
      id="addTeam"
      title="Add Team"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
};

export default AddTeamModal;
