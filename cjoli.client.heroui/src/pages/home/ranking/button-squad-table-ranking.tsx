import { Phase, Squad, useConfig } from "@cjoli/core";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

export const ButtonSquadTableRanking: FC<{
  phase: Phase;
  squad: Squad;
  back?: boolean;
}> = ({ phase, squad, back }) => {
  const { getPath } = useConfig();
  const navigate = useNavigate();

  return (
    <Button
      className="h-10 border-1 border-default-100 px-[16px] py-[10px] text-small font-medium leading-5 mx-2"
      startContent={
        back && (
          <span className="pointer-events-none flex h-[22px] w-[22px] items-center justify-center rounded-full bg-default-100">
            <Icon
              className="text-default-500 [&>path]:stroke-[1.5]"
              icon="solar:arrow-left-linear"
              width={16}
            />
          </span>
        )
      }
      endContent={
        !back && (
          <span className="pointer-events-none flex h-[22px] w-[22px] items-center justify-center rounded-full bg-default-100">
            <Icon
              className="text-default-500 [&>path]:stroke-[1.5]"
              icon="solar:arrow-right-linear"
              width={16}
            />
          </span>
        )
      }
      color="secondary"
      radius="full"
      variant="ghost"
      onPress={() =>
        navigate(
          getPath(
            !back
              ? `/phase/${phase.id}/squad/${squad.id}`
              : `/phase/${phase.id}`
          )
        )
      }
    >
      {squad.name}
    </Button>
  );
};
