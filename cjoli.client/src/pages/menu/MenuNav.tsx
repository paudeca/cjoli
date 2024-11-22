import {
  Navbar,
  Container,
  Offcanvas,
  Nav,
  NavDropdown,
  Col,
  Row,
  Form,
  Button,
  Stack,
  Spinner,
  Badge,
} from "react-bootstrap";
import styled from "@emotion/styled";
import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";
import UpdateModal from "../../modals/UpdateModal";
import * as cjoliService from "../../services/cjoliService";
import {
  Bezier2,
  GearWide,
  House,
  ListOl,
  Person,
  PersonSquare,
  ThreeDotsVertical,
} from "react-bootstrap-icons";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import useScreenSize from "../../hooks/useScreenSize";
import { useCJoli } from "../../hooks/useCJoli";
import useUid from "../../hooks/useUid";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useEstimate } from "../../hooks/useEstimate";
import { UserConfig } from "../../models";
import { useModal } from "../../hooks/useModal";
import { Trans, useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useServer } from "../../hooks/useServer";

const MyImg = styled.img<{ width: string }>`
  width: ${(props) => props.width};
`;

const MyNavbar = styled(Navbar)`
  color: black;
  border-bottom: 3px solid ${(props) => props.theme.colors.secondary};
`;

const MenuNav = () => {
  const { loadRanking, tourney, teams } = useCJoli();
  const {
    user,
    userConfig,
    loadUser,
    handleSaveUserConfig,
    setCountUser,
    countUser,
  } = useUser();
  const uid = useUid();
  const { path } = useServer();
  const { setShow: showLogin } = useModal("login");
  const { setShow: showRegister } = useModal("register");
  const { setShow: showUpdate } = useModal("update");
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const { loading, handleUpdateEstimate } = useEstimate();
  const { t, i18n } = useTranslation();
  const [lang, setLang] = React.useState(i18n.resolvedLanguage);
  const { register: registerServer } = useServer();

  useEffect(() => {
    registerServer("users", (value) => {
      setCountUser(value);
    });
  }, [registerServer, setCountUser]);

  const logout = async () => {
    await cjoliService.logout();
    loadUser(undefined);
    setShow(false);
    if (uid) {
      const ranking = await cjoliService.getRanking(uid);
      loadRanking(ranking);
    }
  };
  const [show, setShow] = React.useState(false);
  const { isAdmin } = useUser();

  const { register } = useForm<UserConfig>({
    values: userConfig,
  });

  const langs = [
    { key: "en", icon: "🇬🇧" },
    { key: "fr", icon: "🇫🇷" },
    { key: "pt", icon: "🇵🇹" },
    { key: "es", icon: "🇪🇸" },
    { key: "de", icon: "🇩🇪" },
  ];

  const tourneyLabel = uid && tourney?.name;

  const team = teams?.find((t) => t.id == userConfig.favoriteTeamId);
  const logo = team?.logo ?? "/logo.png";
  const version = __APP_VERSION__;
  return (
    <MyNavbar
      expand="sm"
      className="bg-body-tertiary mb-3"
      sticky={isMobile ? undefined : "top"}
    >
      <Container fluid>
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
        {user && tourneyLabel && (
          <Stack direction="horizontal" gap={3}>
            <Button onClick={handleUpdateEstimate} disabled={loading}>
              {isMobile
                ? t("menu.refresh", "Refresh")
                : t("menu.refreshEstimate", "Refresh estimate")}
              {!loading && <Bezier2 className="mx-2" size={20} />}
              {loading && (
                <Spinner animation="grow" className="mx-2" size="sm" />
              )}
            </Button>
            <Form.Check
              type="switch"
              label={
                isMobile
                  ? t("menu.custom", "Custom")
                  : t("menu.useCustom", "Use custom")
              }
              role="button"
              {...register("useCustomEstimate", {
                onChange: (e: React.FormEvent<HTMLInputElement>) =>
                  handleSaveUserConfig({
                    ...userConfig,
                    useCustomEstimate: e.currentTarget.checked,
                  }),
              })}
            />
          </Stack>
        )}
        <Navbar.Offcanvas
          id="menu"
          aria-labelledby="menu"
          placement="end"
          show={show}
          onShow={() => setShow(true)}
        >
          <Offcanvas.Header closeButton onClick={() => setShow(false)}>
            <Offcanvas.Title>
              <Trans i18nKey="menu.menu">Menu</Trans>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              {uid && (
                <>
                  <Nav.Link
                    onClick={() => {
                      navigate(`${path}`);
                      setShow(false);
                    }}
                  >
                    <House size={30} className="mx-2" />
                    <Trans i18nKey="menu.home">Home</Trans>
                  </Nav.Link>
                  <Nav.Link
                    onClick={() => {
                      navigate(`${path}ranking`);
                      setShow(false);
                    }}
                  >
                    <ListOl size={30} className="mx-2" />
                    <Trans i18nKey="menu.ranking">Ranking</Trans>
                  </Nav.Link>
                  {isAdmin && (
                    <Nav.Link
                      onClick={() => {
                        navigate(`${path}setting`);
                        setShow(false);
                      }}
                    >
                      <GearWide size={30} className="mx-2" />
                      <Trans i18nKey="menu.setting">Setting</Trans>
                    </Nav.Link>
                  )}
                </>
              )}
              <NavDropdown
                title={langs.find((l) => l.key == lang)?.icon || "🇬🇧"}
              >
                {langs
                  .filter((l) => l.key != lang)
                  .map((lang) => (
                    <NavDropdown.Item
                      key={lang.key}
                      onClick={() => {
                        i18n.changeLanguage(lang.key);
                        setLang(lang.key);
                        dayjs.locale(lang.key);
                      }}
                    >
                      {lang.icon} {t(`lang.${lang.key}`)}
                    </NavDropdown.Item>
                  ))}
              </NavDropdown>
              <NavDropdown
                title={
                  <>
                    <PersonSquare size={30} className="mx-2" />
                    <span>{user?.login || t("user.guest", "Guest")}</span>
                  </>
                }
                className="px-0"
                style={{ minWidth: "140px" }}
                align="end"
              >
                {!user && (
                  <>
                    <NavDropdown.Item onClick={() => showLogin(true)}>
                      <Trans i18nKey="menu.login">Login</Trans>
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => showRegister(true)}>
                      <Trans i18nKey="menu.register">Register</Trans>
                    </NavDropdown.Item>
                  </>
                )}

                {user && (
                  <>
                    <NavDropdown.Item onClick={() => showUpdate(true)}>
                      <Trans i18nKey="menu.update">Update</Trans>
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logout}>
                      <Trans i18nKey="menu.logout">Logout</Trans>
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
      <LoginModal />
      <RegisterModal />
      <UpdateModal />
    </MyNavbar>
  );
};

export default MenuNav;
