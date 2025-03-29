import { Button, Tooltip } from "@heroui/react";
import { CJoliPopover } from "../cjoli-popover";
import { FC, ReactNode, useCallback, useMemo } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CompareIcon,
  EqualsIcon,
} from "../icons";
import { useTranslation } from "react-i18next";
import { Rank, Score, Squad, Team, useCJoli } from "@cjoli/core";
import {
  CJoliTable,
  CJoliTableBody,
  CJoliTableCell,
  CJoliTableColumn,
  CJoliTableHeader,
  CJoliTableRow,
} from "../cjoli-table";
import { TeamName } from "../team-name";

interface ComparePopoverProps {
  team: Team;
  teamB: Team;
  squad?: Squad;
}
export const ComparePopover: FC<ComparePopoverProps> = ({
  team,
  teamB,
  squad,
}) => {
  const { t } = useTranslation();
  const { ranking, tourney, getTeamRank, getScoreForTeam, getScoreFromSquad } =
    useCJoli();
  let rank = getTeamRank(team);
  let rankB = teamB && getTeamRank(teamB);
  const score = getScoreForTeam(team)!;
  let scoreB = teamB && getScoreForTeam(teamB);
  const scoreSquad = squad && getScoreFromSquad(squad, team);
  const scoreSquadB = squad && teamB && getScoreFromSquad(squad, teamB);
  if ((!rank || !rankB) && scoreSquad && scoreSquadB) {
    rank = { order: scoreSquad.rank } as Rank;
    rankB = { order: scoreSquadB.rank } as Rank;
  }

  let datas: { team?: Team; rank?: Rank; score?: Score }[] = [
    { team, rank, score },
  ];
  if (teamB) {
    datas = [...datas, { team: teamB, rank: rankB, score: scoreB }];
  } else {
    const scoreTourney = ranking?.scores.scoreTourney;
    scoreB = scoreTourney;
    datas = [
      ...datas,
      { team: undefined, rank: undefined, score: scoreTourney },
    ];
  }

  type RankScore = { rank: Rank; score: Score };
  type Column = {
    key: string | number;
    header: ReactNode;
    team?: Team;
    rank?: Rank;
    score?: Score;
  };
  type Row = {
    label: string;
    description: string;
    useRank?: boolean;
    call: (rs: RankScore) => number;
    getLabel?: (rs: RankScore) => string | number;
    getInfo?: (rs: RankScore) => string;
    up: boolean;
    active: boolean;
    needTeam: boolean;
  };

  const columns: Column[] = [
    { key: "type", header: "" },
    ...datas.map((d) => ({
      key: d.team?.id ?? 0,
      header: d.team ? <TeamName teamId={d.team.id} /> : tourney?.name,
      ...d,
    })),
  ];

  const rows: Row[] = useMemo(() => {
    const winPt = tourney?.config.win || 2;
    const percent = (value: number, total: number) =>
      total == 0 ? "" : `${Math.round((value / total) * 100)}%`;
    const average = (value: number, total: number) =>
      total == 0 ? "" : `avg: ${(value / total).toFixed(1)}`;

    const formatRank = (rank?: number) => {
      if (rank == undefined) return "";
      if (rank == 0) {
        return ` - ${t("rank.first", "1st")} 🥇`;
      } else if (rank == 1) {
        return ` - ${t("rank.second", "2ème")} 🥈`;
      } else if (rank == 2) {
        return ` - ${t("rank.third", "3rd")} 🥉`;
      } else {
        return ` - ${t("rank.rankth", { rank: rank + 1 })}`;
      }
    };

    let rows: Row[] = [
      {
        label: "Rang",
        description: t("rank.ranking", "Ranking"),
        call: ({ rank }) => rank.order || 0,
        getLabel: ({ rank }) =>
          rank.order == 1
            ? `${t("rank.first")} 🥇`
            : rank.order == 2
              ? `${t("rank.second")} 🥈`
              : rank.order == 3
                ? `${t("rank.third")} 🥉`
                : t("rank.rankth", { rank: rank.order }),
        up: false,
        active: true,
        needTeam: true,
        useRank: true,
      },
      {
        label: "PTS",
        description: t("rank.total", "Points"),
        call: ({ score }) => score.total,
        getInfo: ({ score }) => percent(score.total, winPt * score.game),
        up: true,
        active: !!teamB,
        needTeam: true,
      },
      {
        label: "PJ",
        description: t("rank.game", "Games played"),
        call: ({ score }) => score.game,
        up: true,
        active: false,
        needTeam: false,
      },
      {
        label: "V",
        description: t("rank.win", "Victories"),
        call: ({ score }) => score.win,
        getInfo: ({ score }) =>
          percent(score.win, score.game) + formatRank(score.ranks?.win?.rank),
        up: true,
        active: !!teamB,
        needTeam: false,
      },
      {
        label: "N",
        description: t("rank.neutral", "Drawn games"),
        call: ({ score }) => score.neutral,
        getInfo: ({ score }) =>
          percent(score.neutral, score.game) +
          formatRank(score.ranks?.neutral?.rank),
        up: true,
        active: false,
        needTeam: false,
      },
      {
        label: "D",
        description: t("rank.loss", "Defeats"),
        call: ({ score }) => score.loss,
        getInfo: ({ score }) =>
          percent(score.loss, score.game) + formatRank(score.ranks?.loss?.rank),
        up: false,
        active: !!teamB,
        needTeam: true,
      },
      {
        label: "BP",
        description: t("rank.goalFor", "Goals for"),
        call: ({ score }) => {
          if (!teamB) return score.goalFor / score.game;
          return score.goalFor;
        },
        getLabel: ({ score }) => score.goalFor,
        getInfo: ({ score }) =>
          average(score.goalFor, score.game) +
          formatRank(score.ranks?.goalFor?.rank),
        up: true,
        active: true,
        needTeam: false,
      },
      {
        label: "BC",
        description: t("rank.goalAgainst", "Goals against"),
        call: ({ score }) => {
          if (!teamB) return score.goalAgainst / score.game;
          return score.goalAgainst;
        },
        getLabel: ({ score }) => score.goalAgainst,
        getInfo: ({ score }) =>
          average(score.goalAgainst, score.game) +
          formatRank(score.ranks?.goalAgainst?.rank),
        up: false,
        active: true,
        needTeam: false,
      },
      {
        label: "BL",
        description: t("rank.shutOut", "ShutOut"),
        call: ({ score }) => {
          if (!teamB) return score.shutOut / score.game;
          return score.shutOut;
        },
        getLabel: ({ score }) => score.shutOut,
        getInfo: ({ score }) =>
          percent(score.shutOut, score.game) +
          formatRank(score.ranks?.shutOut?.rank),
        up: true,
        active: true,
        needTeam: false,
      },
      {
        label: "+/-",
        description: t("rank.goalDiff", "Goal average"),
        call: ({ score }) => {
          if (!teamB) return score.goalDiff / score.game;
          return score.goalDiff;
        },
        getLabel: ({ score }) => score.goalDiff,
        getInfo: ({ score }) =>
          average(score.goalDiff, score.game) +
          formatRank(score.ranks?.goalDiff?.rank),
        up: true,
        active: true,
        needTeam: false,
      },
    ];
    if (tourney?.config?.hasPenalty) {
      rows = [
        ...rows,
        {
          label: "PEN",
          description: t("rank.penalty", "Penalties"),
          call: ({ score }) => score.penalty,
          getInfo: ({ score }) =>
            average(score.penalty, score.game) +
            formatRank(score.ranks?.penalty?.rank),
          up: false,
          active: true,
          needTeam: false,
        },
      ];
    }

    return rows;
  }, [t, teamB, tourney?.config]);

  const renderCell = useCallback(
    (r: Row, c: Column) => {
      const getCellValue = ({
        val,
        value,
        getLabel,
        display,
      }: {
        val?: number;
        value?: RankScore;
        getLabel?: (a: RankScore) => string | number | undefined;
        display: boolean;
      }) => {
        if (val == undefined || !display) {
          return "-";
        } else if (value && getLabel) {
          return getLabel(value);
        } else {
          return val;
        }
      };
      const getCellEvolution = (result: number) => {
        if (result == 1) {
          return <ChevronUpIcon className="text-success" size={16} />;
        } else if (result == -1) {
          return <ChevronDownIcon className="text-danger" size={16} />;
        } else if (!!valB && result == 0) {
          return <EqualsIcon className="text-primary" size={16} />;
        }
      };

      if (c.key == "type") {
        return (
          <Tooltip content={r.description} delay={1000}>
            {r.label}
          </Tooltip>
        );
      }
      const calcul = r.up
        ? (a: number, b: number) => (a > b ? 1 : a == b ? 0 : -1)
        : (a: number, b: number) => (a < b ? 1 : a == b ? 0 : -1);
      const value = r.useRank ? c.rank : c.score;
      const valueB = r.useRank ? rankB : scoreB;
      const val = value && r.call({ rank: c.rank!, score: c.score! });
      const valB = valueB && r.call({ rank: rankB!, score: scoreB! });
      const result =
        val == undefined || !valueB || valB == undefined
          ? 0
          : calcul(val, valB);
      const display = !r.needTeam || !!team;

      return (
        <div className="flex whitespace-nowrap">
          {getCellValue({
            val,
            value: { rank: c.rank!, score: c.score! },
            getLabel: r.getLabel,
            display,
          })}
          {r.getInfo && value && display && (
            <span className="text-[11px] text-gray-400 mx-1">
              {r.getInfo({ rank: c.rank!, score: c.score! })}
            </span>
          )}
          {r.active && c.team?.id != teamB.id && (
            <span className="mx-1">{getCellEvolution(result)}</span>
          )}
        </div>
      );
    },
    [rankB, scoreB, team, teamB.id]
  );

  return (
    <CJoliPopover
      title={t("match.compare", "Compare")}
      trigger={
        <Button
          isIconOnly
          aria-label="Team"
          variant="light"
          color="primary"
          size="sm"
          tabIndex={-1}
        >
          <CompareIcon
            size={20}
            className="text-default-500 [&>path]:stroke-[1.5]"
          />
        </Button>
      }
      body={
        <CJoliTable>
          <CJoliTableHeader columns={columns}>
            {(c) => (
              <CJoliTableColumn key={c.key}>
                <span className="flex items-center">{c.header}</span>
              </CJoliTableColumn>
            )}
          </CJoliTableHeader>
          <CJoliTableBody items={rows}>
            {(r) => (
              <CJoliTableRow key={r.label} columns={columns}>
                {(c) => (
                  <CJoliTableCell key={c.key}>
                    {renderCell(r, c)}
                  </CJoliTableCell>
                )}
              </CJoliTableRow>
            )}
          </CJoliTableBody>
        </CJoliTable>
      }
    />
  );
};
