import { beforeEach, describe, it } from "vitest";
import {
  createMatch,
  createPhase,
  createPosition,
  createRanking,
  createSquad,
  createTeam,
  createTourney,
  createUser,
  initPage,
  renderPage,
  reset,
  setDesktop,
} from "../../../../__tests__/testUtils";
import MatchRow from "../MatchRow";
import { useForm } from "react-hook-form";
import { screen } from "@testing-library/react";
import { useCJoli } from "../../../../hooks/useCJoli";
import { useEffect } from "react";
import { useUser } from "../../../../hooks/useUser";
import { Match, User } from "../../../../models";

const scoreA = 1;
const scoreB = 0;

const match = createMatch({
  phaseId: 1,
  squadId: 1,
  scoreA,
  scoreB,
  done: true,
  positionIdA: 1,
  positionIdB: 2,
});

const user = createUser({});

const render = async ({ match, user }: { match: Match; user: User }) => {
  const tourney = createTourney({
    id: 1,
    teams: [createTeam({ id: 1 }), createTeam({ id: 2 })],
    phases: [
      createPhase({
        id: 1,
        squads: [
          createSquad({
            id: 1,
            matches: [match],
            positions: [
              createPosition({ id: 1, teamId: 1 }),
              createPosition({ id: 2, teamId: 2 }),
            ],
          }),
        ],
      }),
    ],
  });
  const Row = initPage(MatchRow, () => {
    const { register } = useForm();
    const { loadRanking } = useCJoli();
    const { loadUser } = useUser();
    useEffect(() => {
      loadRanking(createRanking({ tourney }));
      loadUser(user);
    }, [loadRanking, loadUser]);
    return { register };
  });
  await renderPage(
    <table>
      <tbody>
        <Row
          match={match}
          rowSpan={1}
          index={0}
          saveMatch={async () => {}}
          updateMatch={async () => {}}
          clearMatch={async () => {}}
        />
      </tbody>
    </table>
  );
  screen.getByText(scoreA);
  screen.getByText(scoreB);
};

describe("MatchRow", () => {
  beforeEach(reset);
  it("render", async () => {
    await render({ match, user });
  });
  it("desktop", async () => {
    setDesktop();
    await render({ match, user });
  });
  /*it("userMatch", async () => {
    setDesktop();
    await render({
      match: {
        ...match,
        done: false,
        userMatch: {
          id: 1,
          scoreA: 2,
          scoreB: 0,
          forfeitA: false,
          forfeitB: false,
        },
      },
      user: {
        ...user,
        role: "ADMIN",
        configs: [{ useCustomEstimate: true, tourneyId: 1 } as UserConfig],
      },
    });
    screen.debug();
  });*/
});
