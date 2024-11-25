import { Badge, Col, Navbar, Row } from "react-bootstrap";
import styled from "@emotion/styled";
import { useCJoli } from "../../hooks/useCJoli";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import useUid from "../../hooks/useUid";
import useScreenSize from "../../hooks/useScreenSize";
import { useTranslation } from "react-i18next";
import { Person, ThreeDotsVertical } from "react-bootstrap-icons";

const MyImg = styled.img<{ width: string }>`
  width: ${(props) => props.width};
`;

interface MenuBrandProps {
  setShow: (show: boolean) => void;
}

const MenuBrand = ({ setShow }: MenuBrandProps) => {
  const { tourney, teams } = useCJoli();
  const { userConfig, countUser } = useUser();
  const navigate = useNavigate();
  const uid = useUid();
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();

  const team = teams?.find((t) => t.id == userConfig.favoriteTeamId);

  const logo = team?.logo ?? "/logo.png";
  const version = __APP_VERSION__;
  const tourneyLabel = uid && tourney?.name;

  return (
    <Navbar.Brand>
      <Row className="align-items-center">
        <Col>
          <MyImg
            src={logo}
            width="60px"
            className="mx-4"
            onClick={() => navigate("/")}
            role="button"
          />
          {team?.datas?.logo && (
            <MyImg
              src={team.datas.logo}
              width="60px"
              className="mr-4"
              onClick={() => navigate("/")}
              role="button"
            />
          )}
        </Col>
        {!tourneyLabel && isMobile && <Col>Ice Hockey</Col>}
        {!tourneyLabel && !isMobile && (
          <Col>
            {t("title", "CJoli - Ice Hockey Tournament")} - {version}
          </Col>
        )}
        {tourneyLabel && <Col>{tourneyLabel}</Col>}
        <Col>
          <Badge
            bg="secondary"
            className="d-flex menu"
            style={{ maxWidth: 60 }}
            data-testid="countUser"
          >
            {countUser}
            <Person />
          </Badge>
        </Col>
        <Col className="d-flex justify-content-end">
          <Navbar.Toggle aria-controls="menu" onClick={() => setShow(true)}>
            <ThreeDotsVertical />
          </Navbar.Toggle>
        </Col>
      </Row>
    </Navbar.Brand>
  );
};

export default MenuBrand;
