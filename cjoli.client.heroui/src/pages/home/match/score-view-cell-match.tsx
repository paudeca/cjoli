import { IMatch } from "@/lib/models";
import { Chip } from "@heroui/react";
import { FC } from "react";

interface ScoreViewCellMatchProps {
  match: IMatch;
  mode: "A" | "B";
}
export const ScoreViewCellMatch: FC<ScoreViewCellMatchProps> = ({
  match,
  mode,
}) => {
  const classNames = {
    win: "from-emerald-500 to-teal-500",
    neutral: "from-yellow-500 to-orange-500",
    loss: "from-rose-500 to-orange-500",
  };
  let badge: keyof typeof classNames =
    (mode == "A" && match.scoreA > match.scoreB) ||
    (mode == "B" && match.scoreA < match.scoreB)
      ? "win"
      : match.scoreA === match.scoreB
        ? "neutral"
        : "loss";
  if (match.forfeitA) {
    badge = mode == "A" ? "loss" : "win";
  } else if (match.forfeitB) {
    badge = mode == "A" ? "win" : "loss";
  }

  return (
    <Chip
      classNames={{
        base: `mx-2 min-w-[40px] text-center bg-gradient-to-br ${classNames[badge]} border-small border-white/50`,
        content: "drop-shadow shadow-black text-white",
      }}
      radius="sm"
    >
      {mode == "A" ? match.scoreA : match.scoreB}
    </Chip>
  );
};
