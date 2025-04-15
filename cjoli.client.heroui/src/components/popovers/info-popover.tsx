import { Avatar, Button } from "@heroui/react";
import { CJoliPopover } from "../cjoli-popover";
import { FC, Fragment, ReactNode } from "react";
import { Score, ScoreSource, Squad, useCJoli } from "@cjoli/core";
import { Trans, useTranslation } from "react-i18next";
import { ChevronDownIcon, ChevronUpIcon, EqualsIcon, InfoIcon } from "../icons";
import { TeamName } from "../team-name";

export const InfoPopover: FC<{ score: Score; squad: Squad }> = ({
  score,
  squad,
}) => {
  const { getTeamInfo, tourney, getScoreFromPosition } = useCJoli();
  const { t } = useTranslation();

  if (!tourney) {
    return <></>;
  }

  const { name, logo } = getTeamInfo(score.positionId);

  const sources = Object.keys(score.sources)
    .map((k) => ({ ...score.sources[parseInt(k)], positionId: parseInt(k) }))
    .filter((s) => s.type != "total");

  const {
    config: { win, neutral, loss },
  } = tourney;

  const details = [
    { label: "V", value: score.win, pts: win },
    { label: "N", value: score.neutral, pts: neutral },
    { label: "D", value: score.loss, pts: loss },
  ];

  let i = 0;
  const result = details.reduce((acc, d) => {
    if (d.value != 0 && d.pts != 0) {
      return [
        ...acc,
        <Fragment key={i++}>
          {acc.length > 0 && <> + </>}
          <b>{d.value}</b>
          {d.label} x <b>{d.pts}</b>
        </Fragment>,
      ];
    }
    return acc;
  }, [] as ReactNode[]);

  let items: { title: ReactNode; content: ReactNode }[] = [
    { title: t("ranking.rank", "Rank"), content: score.rank },
    { title: "PTS", content: score.total },
  ];
  if (score.total > 0) {
    items = [
      ...items,
      {
        title: t("ranking.calculation", "Calculation"),
        content: (
          <>
            {result.map((r) => r)} = {score.total}pts
          </>
        ),
      },
    ];
  }
  const getSourceValue = (source: ScoreSource) => {
    switch (source.type) {
      case "direct":
        return source.winner ? (
          <div>
            <Trans i18nKey="ranking.victory">Victory</Trans>
          </div>
        ) : (
          <div>
            <Trans i18nKey="ranking.defeat">Defeat</Trans>
          </div>
        );
    }
  };

  items = [
    ...items,
    ...sources.map((s) => {
      const positionB = s.positionId;
      const source = score.sources[positionB];
      const scoreB = getScoreFromPosition(positionB, squad.id);

      const iconCompare = scoreB ? (
        score.rank < scoreB.rank ? (
          <ChevronUpIcon className="text-success" size={16} />
        ) : score.rank > scoreB.rank ? (
          <ChevronDownIcon className="text-danger" size={16} />
        ) : (
          <EqualsIcon className="text-primary" size={16} />
        )
      ) : undefined;

      return {
        title: (
          <div className="inline-flex">
            {t("ranking.equality", "Equality")} {iconCompare}
          </div>
        ),
        content: (
          <div className="flex flex-col">
            <div className="inline-flex">
              <TeamName positionId={positionB} short />
            </div>
            <div className="font-semibold">{getSourceValue(source)}</div>
          </div>
        ),
      };
    }),
  ];

  return (
    <CJoliPopover
      title={
        <>
          <Avatar
            src={logo}
            isBordered
            radius="md"
            imgProps={{ className: "max-h-[30px]" }}
          ></Avatar>
          {name}
        </>
      }
      trigger={
        <Button
          isIconOnly
          aria-label="Team"
          variant="light"
          color="primary"
          size="sm"
        >
          <InfoIcon
            size={20}
            className="text-default-500 [&>path]:stroke-[1.5]"
          />
        </Button>
      }
      body={
        <ul role="list" className="divide-y divide-gray-100 p-4">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between gap-x-6 py-2">
              <div className="min-w-0 flex-auto">
                <p className="text-sm/6 font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="mt-1 truncate text-xs/5 text-gray-500">
                  {item.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      }
    />
  );
};
