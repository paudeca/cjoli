import { Team, useServer } from "@cjoli/core";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";
import { ChevronIcon } from "./icons";

export const TeamButton: FC<{ team: Team }> = ({ team }) => {
  const navigate = useNavigate();
  const { getPath } = useServer();

  return (
    <Button
      isIconOnly
      aria-label="Team"
      variant="light"
      onPress={() => navigate(getPath(`/team/${team.id}`))}
    >
      <ChevronIcon
        width={16}
        className="text-default-500 [&>path]:stroke-[1.5]"
      />
    </Button>
  );
};
