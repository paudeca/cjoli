import { Button, Card, Table } from "react-bootstrap";
import useScreenSize from "../../../hooks/useScreenSize";
import { useCJoli } from "../../../hooks/useCJoli";
import { Trans, useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { bgSecondary } from "../../../styles";
import CJoliTooltip from "../../../components/CJoliTooltip";
import { Team } from "../../../models";

const MyTh = styled("th")`
  ${bgSecondary}
`;
const MyTd = MyTh.withComponent("td");

interface TeamPlayerProps {
  team: Team;
}

const TeamPlayer = ({ team }: TeamPlayerProps) => {
  const { classNamesCast } = useCJoli();
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();
  return (
    <Card.Body>
      <Table
        striped
        bordered
        hover
        size="sm"
        style={{ textAlign: "center" }}
        className={classNamesCast.table}
      >
        <thead>
          <tr>
            <th rowSpan={isMobile ? 2 : 1} className={classNamesCast.padding}>
              #
            </th>
            <th
              colSpan={isMobile ? 8 : 1}
              className={`${classNamesCast.padding} w-50`}
            >
              <Trans i18nKey="team.player.name">Player</Trans>
            </th>
            <MyTh rowSpan={isMobile ? 2 : 1} className={classNamesCast.padding}>
              <CJoliTooltip info={t("team.player.point", "Points")}>
                PTS
              </CJoliTooltip>
            </MyTh>
            {!isMobile && (
              <>
                <th className={classNamesCast.padding}>
                  <CJoliTooltip info={t("team.player.goal", "Goal")}>
                    B
                  </CJoliTooltip>
                </th>
                <th className={classNamesCast.padding}>
                  <CJoliTooltip info={t("team.player.assist", "Assist")}>
                    A
                  </CJoliTooltip>
                </th>
                <th className={classNamesCast.padding}>
                  <CJoliTooltip info={t("team.player.penalty", "Penalty")}>
                    PEN
                  </CJoliTooltip>
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {team.datas?.players.map((p) => (
            <tr key={p.id}>
              <td>{p.number}</td>
              <td>{p.name}</td>
              <MyTd>{p.total}</MyTd>
              <td>{p.goal}</td>
              <td>{p.assist}</td>
              <td>{p.penalty}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button>Add Player</Button>
    </Card.Body>
  );
};

export default TeamPlayer;
