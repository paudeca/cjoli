import { Card, Form, Nav } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import RankTable from "./ranking/RankTable";
import Loading from "../../components/Loading";
import { Phase } from "../../models";
import { useCJoli } from "../../hooks/useCJoli";
import { useNavigate, useParams } from "react-router-dom";
import { Element } from "react-scroll";
import { useServer } from "../../hooks/useServer";
import { ClipboardData } from "react-bootstrap-icons";
import styled from "@emotion/styled";
import { useState } from "react";

const Check = styled(Form.Check)`
  & label {
    cursor: pointer;
    user-select: none;
  }
`;

interface RankingStackProps extends JSX.IntrinsicAttributes {
  phase: Phase;
  modeCast?: boolean;
}

const RankingStack = ({ phase, modeCast }: RankingStackProps) => {
  const { phases, selectDay, isCastPage } = useCJoli();
  const { path } = useServer();
  const navigate = useNavigate();
  const { phaseId, squadId } = useParams();
  const [displayPhase, setDisplayPhase] = useState(false);

  const filterPhases =
    phases?.filter(
      (phase: Phase) => !squadId || !phaseId || parseInt(phaseId) == phase.id
    ) || [];

  const handleClick = (phase: Phase) => {
    selectDay("0");
    navigate(`${path}phase/${phase.id}`);
  };

  return (
    <CJoliStack
      gap={0}
      className={`${isCastPage ? "col-md-10" : "col-md-8"} mx-auto mt-5`}
      data-testid="ranking"
    >
      <div className="p-2">
        <CJoliCard>
          <Element name="ranking">
            <Loading ready={!!phases && !!phase}>
              {!modeCast && (
                <Card.Header>
                  <Nav variant="underline" activeKey={`${phase?.id}`}>
                    {filterPhases.map((phase) => (
                      <Nav.Item key={phase.id}>
                        <Nav.Link onClick={() => handleClick(phase)}>
                          {phase.name}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                  <Check
                    type="switch"
                    id="rankingPhase"
                    reverse
                    role="button"
                    label={
                      <span>
                        <ClipboardData /> Display phase ranking
                      </span>
                    }
                    checked={displayPhase}
                    onChange={() => setDisplayPhase(!displayPhase)}
                  />
                </Card.Header>
              )}
              <RankTable phase={phase} displayPhase={displayPhase} />
            </Loading>
          </Element>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default RankingStack;
