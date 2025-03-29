import { CounterInput } from "@/components";
import { ChevronDownOneIcon } from "@/components/icons";
import { useCJoli, useUser } from "@/lib/hooks";
import { Match } from "@/lib/models";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NumberInput,
  Tooltip,
} from "@heroui/react";
import { FC, useContext } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { MatchContext } from "./match-context";
import dayjs from "dayjs";

interface ScoreInputCellMatchProps {
  id: string;
  match: Match;
  teamA?: boolean;
  teamB?: boolean;
}

export const ScoreInputCellMatch: FC<ScoreInputCellMatchProps> = ({
  id,
  match,
  teamA,
}) => {
  const { isAdmin, isConnected } = useUser();
  const { tourney } = useCJoli();
  const placeholder = teamA
    ? match.estimate?.scoreA.toString()
    : match.estimate?.scoreB.toString();
  const hasOption =
    isAdmin && (tourney?.config?.hasForfeit || tourney?.config?.hasPenalty);
  const form = useFormContext();
  const { saveMatch, updateMatch } = useContext(MatchContext)!;
  const editMode =
    isAdmin ||
    (isConnected && match.time > dayjs().format("YYYY-MM-DDTHH:mm:ss"));
  const { t } = useTranslation();

  if (!editMode) {
    return (
      <Tooltip content={t("match.simulated", "Simulated result")} delay={1000}>
        <Chip
          variant="light"
          radius="sm"
          className="text-gray-300 mx-2 min-w-[40px]"
        >
          {placeholder}
        </Chip>
      </Tooltip>
    );
  }
  return (
    <NumberInput
      placeholder={placeholder}
      data-testid={id}
      onChange={(e) => form.setValue(id, e)}
      size="sm"
      hideStepper
      minValue={0}
      aria-label="score-input"
      classNames={{
        base: "mx-2 w-auto",
        inputWrapper: "bg-white max-w-[80px] h-8 pe-0",
        input: "placeholder:text-gray-200",
      }}
      variant="bordered"
      endContent={
        hasOption && (
          <Dropdown closeOnSelect={false} className="cjoli">
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light" tabIndex={-1}>
                <ChevronDownOneIcon size={20} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Static Actions"
              variant="light"
              selectionMode="none"
            >
              <>
                {tourney.config.hasForfeit && (
                  <DropdownItem
                    key="forfeit"
                    variant="flat"
                    color="primary"
                    textValue="forfeit"
                    onPress={() =>
                      saveMatch({
                        ...match,
                        forfeitA: !!teamA,
                        forfeitB: !teamA,
                        scoreA: 0,
                        scoreB: 0,
                      })
                    }
                  >
                    <Trans i18nKey="match.forfeit">Forfeit</Trans>
                  </DropdownItem>
                )}
                {tourney.config.hasPenalty && (
                  <DropdownItem key="penalty" textValue="penalty">
                    <CounterInput
                      count={teamA ? match.penaltyA : match.penaltyB}
                      onChange={(count) =>
                        updateMatch({
                          ...match,
                          penaltyA: teamA ? count : match.penaltyA,
                          penaltyB: !teamA ? count : match.penaltyB,
                        })
                      }
                    />
                  </DropdownItem>
                )}
              </>
            </DropdownMenu>
          </Dropdown>
        )
      }
    />
  );
};
