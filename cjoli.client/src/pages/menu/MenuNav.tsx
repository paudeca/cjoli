/* eslint-disable max-lines */
import {
  Navbar,
  Container,
  Offcanvas,
  Nav,
  NavDropdown,
  Stack,
  ToggleButton,
  Button,
  Spinner,
} from "react-bootstrap";
import styled from "@emotion/styled";
import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";
import UpdateModal from "../../modals/UpdateModal";
import * as cjoliService from "../../services/cjoliService";
import {
  BoxArrowRight,
  ChevronDoubleRight,
  Controller,
  DoorOpen,
  FilePerson,
  GearWide,
  HeptagonHalf,
  House,
  Images,
  ListOl,
  PencilSquare,
  PersonSquare,
  Tv,
} from "react-bootstrap-icons";
import { useUser } from "../../hooks/useUser";
import { useLocation, useNavigate } from "react-router-dom";
import useScreenSize from "../../hooks/useScreenSize";
import { useCJoli } from "../../hooks/useCJoli";
import useUid from "../../hooks/useUid";
import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Trans, useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useServer } from "../../hooks/useServer";
import MenuBrand from "./MenuBrand";
import BetScoreTotal from "./BetScoreTotal";
import TeamSelect from "../../components/TeamSelect";
import { MyProgressBar } from "../../components/Loading";

const MyNavbar = styled(Navbar)`
  color: black;
  border-bottom: 3px solid ${(props) => props.theme.colors.secondary};
`;

const langs = [
  { key: "en", icon: "🇬🇧" },
  { key: "fr", icon: "🇫🇷" },
  { key: "pt", icon: "🇵🇹" },
  { key: "es", icon: "🇪🇸" },
  { key: "de", icon: "🇩🇪" },
  { key: "nl", icon: "🇳🇱" },
  { key: "fi", icon: "🇫🇮" },
  { key: "cs", icon: "🇨🇿" },
];

// eslint-disable-next-line max-lines-per-function, complexity, max-statements
const MenuNav = () => {
  const { loadRanking, loadTourneys, tourney, isCastPage, teams } = useCJoli();
  const {
    user,
    userConfig,
    loadUser,
    handleSaveUserConfig,
    isAdmin,
    isRootAdmin,
    userConfig: { useCustomEstimate },
    saveFilteredTeam,
  } = useUser();
  const uid = useUid();
  const { path, register } = useServer();
  const { setShow: showLogin } = useModal("login");
  const { setShow: showRegister } = useModal("register");
  const { setShow: showUpdate } = useModal("update");
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.resolvedLanguage);
  const { pathname } = useLocation();
  const isRootPath = pathname == "/";

  const logout = async () => {
    await cjoliService.logout();
    loadUser(undefined);
    setShow(false);
    if (uid) {
      const ranking = await cjoliService.getRanking(uid);
      loadRanking(ranking);
    }
  };
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const useEstimate =
    (isAdmin && useCustomEstimate) ||
    (!isAdmin && localStorage.getItem("useEstimate") == "true");

  const tourneyLabel = uid && tourney?.name;

  const [started, setStarted] = useState(false);

  useEffect(() => {
    register("estimation", async ({ started }) => {
      setStarted(started!);
    });
  }, [register]);

  return (
    <MyNavbar
      expand="sm"
      className="bg-body-tertiary mb-3"
      sticky={isMobile ? undefined : "top"}
    >
      <Container fluid>
        <MenuBrand setShow={setShow} />
        {!uid && (
          <Stack direction="horizontal">
            <div style={{ width: 300, paddingTop: 5, paddingBottom: 5 }}>
              <TeamSelect
                teams={teams || []}
                value={userConfig.filteredTeamId}
                onChangeTeam={async (team) => {
                  const teamId = team ? team.id : 0;
                  saveFilteredTeam(teamId);
                  const tourneys = await cjoliService.getTourneys(teamId);
                  loadTourneys(tourneys);
                  if (!isRootPath) {
                    navigate(`/team/${teamId}`);
                  }
                }}
                placeholder={t("home.selectTeam", "Select your team to filter")}
                isClearable={isRootPath}
              />
            </div>
            {!!userConfig.filteredTeamId && isRootPath && (
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link
                  onClick={() => navigate(`/team/${userConfig.filteredTeamId}`)}
                  className="text-secondary"
                >
                  <HeptagonHalf size={20} className="ms-2" />
                  <ChevronDoubleRight size={20} />
                </Nav.Link>
              </Nav>
            )}
          </Stack>
        )}
        {tourneyLabel && !isCastPage && (
          <Stack direction="horizontal" gap={3}>
            <ToggleButton
              id="toggle-check"
              type="checkbox"
              variant="outline-primary"
              checked={useEstimate}
              value="1"
              onChange={async (e) => {
                setLoading(true);
                localStorage.setItem(
                  "useEstimate",
                  e.currentTarget.checked ? "true" : "false",
                );
                if (isAdmin) {
                  await handleSaveUserConfig({
                    ...userConfig,
                    useCustomEstimate: e.currentTarget.checked,
                  });
                } else {
                  const ranking = await cjoliService.getRanking(uid);
                  loadRanking(ranking);
                }
                setLoading(false);
              }}
            >
              {loading ? (
                <Spinner animation="grow" size="sm" className="mx-2" />
              ) : (
                <Controller className="mx-2" />
              )}
              <Trans i18nKey="simulation.tooltip">Simulation</Trans>
              {started && <MyProgressBar />}
            </ToggleButton>
            <div>
              <BetScoreTotal />
            </div>
          </Stack>
        )}
        {isCastPage && (
          <Button variant="outline-primary" onClick={() => navigate(`${path}`)}>
            <Trans i18nKey="button.close">Close</Trans>
            <BoxArrowRight className="mx-2" />
          </Button>
        )}
        {!isCastPage && (
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
                {!user && (
                  <>
                    <Nav.Link onClick={() => showLogin(true)}>
                      <FilePerson size={30} className="mx-2" />
                      <Trans i18nKey="menu.login">Login</Trans>
                    </Nav.Link>
                    <Nav.Link onClick={() => showRegister(true)}>
                      <PencilSquare size={30} className="mx-2" />
                      <Trans i18nKey="menu.register">Register</Trans>
                    </Nav.Link>
                  </>
                )}
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
                    <Nav.Link
                      onClick={() => {
                        navigate(`${path}gallery`);
                        setShow(false);
                      }}
                    >
                      <Images size={30} className="mx-2" />
                      <Trans i18nKey="menu.gallery">Gallery</Trans>
                    </Nav.Link>
                    <Nav.Link
                      onClick={() => {
                        navigate(`${path}cast`);
                        setShow(false);
                      }}
                    >
                      <Tv size={30} className="mx-2" />
                      <Trans i18nKey="menu.cast">Cast</Trans>
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
                {user && (
                  <Nav.Link onClick={logout}>
                    <DoorOpen size={30} className="mx-2" />
                    <Trans i18nKey="menu.logout">Logout</Trans>
                  </Nav.Link>
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
                      {isRootAdmin && (
                        <NavDropdown.Item onClick={() => navigate(`/admin`)}>
                          <Trans i18nKey="menu.admin">Administration</Trans>
                        </NavDropdown.Item>
                      )}
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
        )}
      </Container>
      <LoginModal />
      <RegisterModal />
      <UpdateModal />
    </MyNavbar>
  );
};

export default MenuNav;
