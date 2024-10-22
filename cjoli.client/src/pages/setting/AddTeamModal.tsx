import React from "react";
import CJoliModal, { Field } from "../../components/CJoliModal";
import { Team } from "../../models";
import * as settingService from "../../services/settingService";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useQuery } from "@tanstack/react-query";

interface AddTeamModalProps {
  onAddTeam: (team: Partial<Team>) => Promise<boolean>;
}

const AddTeamModal = ({ onAddTeam }: AddTeamModalProps) => {
  const [teams, setTeams] = React.useState<Team[]>([]);

  const { t } = useTranslation();
  const { showToast } = useToast();

  useQuery({
    queryKey: ["getTeams"],
    queryFn: async () => {
      const teams = await settingService.getTeams();
      setTeams(teams);
    },
  });

  const fields: Field<{ name: string | number }>[] = [
    {
      id: "name",
      label: "Name",
      type: "select",
      creatable: true,
      options: teams.map((t) => ({ label: t.name, value: t.id })),
      autoFocus: true,
    },
  ];

  const onSubmit = async ({ name }: { name: string | number }) => {
    const team =
      typeof name == "number"
        ? { id: name, name: teams.find((t) => t.id == name)!.name }
        : { id: 0, name };
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
