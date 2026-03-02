import styled from "@emotion/styled";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "react-bootstrap";
import { Clock, PencilSquare, Trash3 } from "react-bootstrap-icons";
import CJoliCard from "./CJoliCard";
import ScoreBage from "./ScoreBadge";
import { Match, Team } from "../models";
import { useCJoli } from "../hooks/useCJoli";
import { ReactNode } from "react";
import dayjs from "dayjs";
import useScreenSize from "../hooks/useScreenSize";

const Item = styled("div")<{ mode: "left" | "right" }>`
  position: relative;
  background-color: inherit;
  width: 50%;

  &.left {
    padding: 0px 40px 20px 0px;
    left: 0;
  }
  &.right {
    padding: 0px 40px 20px 40px;
    left: 50%;
  }

  &::after {
    content: "";
    position: absolute;
    width: 25px;
    height: 25px;
    right: -11px;
    background-color: ${(props) => props.theme.colors.primary};
    top: 15px;
    border-radius: 50%;
    z-index: 1;
  }
  &.right::after {
    left: -14px;
  }
  &::before {
    content: " ";
    position: absolute;
    top: 18px;
    z-index: 1;
    border: medium solid white;
  }
  &.left::before {
    right: 30px;
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent
      ${(props) => props.theme.colors.secondary};
  }
  &.right::before {
    left: 30px;
    border-width: 10px 10px 10px 0;
    border-color: transparent ${(props) => props.theme.colors.secondary}
      transparent transparent;
  }
  @media screen and (max-width: 600px) {
    &,
    &.left,
    &.right {
      width: 100%;
      padding-left: 24px;
      padding-right: 0px;
      left: 0px;
    }

    &::before,
    &.left::before,
    &.right::before {
      left: 14px;
      border: medium solid white;
      border-width: 10px 10px 10px 0;
      border-color: transparent ${(props) => props.theme.colors.secondary}
        transparent transparent;
    }
    &.left::before {
      right: auto;
    }
    &::after {
      left: -14px;
    }
  }
`;

const ItemMiddle = styled("div")`
  padding: 0px 0px 20px 0px;

  & .card {
    z-index: 2;
    font-size: 18;
    font-weight: 600;
    background: ${(props) => props.theme.colors.primary};
    color: white;
  }
  @media screen and (max-width: 600px) {
    & {
      padding-left: 14px;
    }
  }
`;

const MyCardTitle = styled(CardTitle)<{ primary: boolean }>`
  background-color: ${(props) =>
    props.primary ? props.theme.colors.secondary : "white"};
  color: ${(props) =>
    props.primary ? "white" : props.theme.colors.secondary} !important;
`;

const MyBadge = styled(Badge)`
  position: relative;
  left: 50%;
  top: 5px;
  margin-left: -35px;
  z-index: 2;
  @media screen and (max-width: 600px) {
    left: 0px;
  }
`;

interface CJoliTimeEventProps {
  mode: "left" | "right" | "middle";
  match: Match;
  team?: Team;
  title: string;
  time: number;
  children: ReactNode;
  isGoal?: boolean;
}

const CJoliTimeEvent = ({
  mode,
  match,
  team,
  title,
  time,
  children,
  isGoal,
}: CJoliTimeEventProps) => {
  const { getTeamLogo } = useCJoli();
  const { isMobile } = useScreenSize();

  return (
    <>
      <MyBadge bg="light">
        <span className={`small text-muted d-flex align-items-center`}>
          <Clock className="me-1" />
          {dayjs.duration(time * 1000).format("mm:ss")}
        </span>
      </MyBadge>
      {mode == "middle" ? (
        <ItemMiddle
          className={`d-flex ${isMobile ? "justify-content-start" : "justify-content-center"}`}
        >
          <Card className="py-1 px-4">
            <>{title}</>
          </Card>
          <Button variant="" onClick={() => {}} size="sm">
            <Trash3 />
          </Button>
        </ItemMiddle>
      ) : (
        <Item mode={mode} className={mode}>
          <CJoliCard small={!isGoal}>
            <MyCardTitle
              className={`p-1 px-2 d-flex ${mode == "left" && !isMobile ? "justify-content-end" : "justify-content-start"} align-items-center`}
              primary={!!isGoal}
            >
              <Badge bg="light" pill className="mx-2">
                <img
                  src={getTeamLogo(team)}
                  style={{
                    maxWidth: "30px",
                    maxHeight: "30px",
                  }}
                  className={"mx-2"}
                />
              </Badge>
              {title}
              <Button variant="" onClick={() => {}} size="sm">
                <Trash3 />
              </Button>
              <Button variant="" onClick={() => {}} size="sm">
                <PencilSquare />
              </Button>
            </MyCardTitle>
            <CardHeader>
              <div
                className={`d-flex ${mode == "left" && !isMobile ? "justify-content-end" : "justify-content-start"}`}
              >
                <ScoreBage match={match} mode="A" sm />
                <h5>-</h5>
                <ScoreBage match={match} mode="B" sm />
              </div>
            </CardHeader>
            <CardBody>{children}</CardBody>
          </CJoliCard>
        </Item>
      )}
    </>
  );
};

export default CJoliTimeEvent;
