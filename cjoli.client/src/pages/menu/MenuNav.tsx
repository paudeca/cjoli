import {
  Navbar,
  Container,
  Offcanvas,
  Nav,
  NavDropdown,
  Stack,
  ToggleButton,
} from "react-bootstrap";
import styled from "@emotion/styled";
import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";
import UpdateModal from "../../modals/UpdateModal";
import * as cjoliService from "../../services/cjoliService";
import {
  Controller,
  GearWide,
  House,
  ListOl,
  PersonSquare,
} from "react-bootstrap-icons";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import useScreenSize from "../../hooks/useScreenSize";
import { useCJoli } from "../../hooks/useCJoli";
import useUid from "../../hooks/useUid";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Trans, useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useServer } from "../../hooks/useServer";
import MenuBrand from "./MenuBrand";
import BetScoreTotal from "./BetScoreTotal";

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
];

const MenuNav = () => {
  const { loadRanking, tourney } = useCJoli();
  const { user, userConfig, loadUser, handleSaveUserConfig } = useUser();
  const uid = useUid();
  const { path } = useServer();
  const { setShow: showLogin } = useModal("login");
  const { setShow: showRegister } = useModal("register");
  const { setShow: showUpdate } = useModal("update");
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const { t, i18n } = useTranslation();
  const [lang, setLang] = React.useState(i18n.resolvedLanguage);

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
  const {
    isAdmin,
    isRootAdmin,
    userConfig: { useCustomEstimate },
  } = useUser();

  const tourneyLabel = uid && tourney?.name;

  return (
    <MyNavbar
      expand="sm"
      className="bg-body-tertiary mb-3"
      sticky={isMobile ? undefined : "top"}
    >
      <Container fluid>
        <MenuBrand setShow={setShow} />
        {user && tourneyLabel && (
          <Stack direction="horizontal" gap={3}>
            <ToggleButton
              id="toggle-check"
              type="checkbox"
              variant="outline-primary"
              checked={useCustomEstimate}
              value="1"
              onChange={(e) =>
                handleSaveUserConfig({
                  ...userConfig,
                  useCustomEstimate: e.currentTarget.checked,
                })
              }
            >
              <Controller className="mx-2" />
              Simulation
            </ToggleButton>
            <div>
              <BetScoreTotal />
            </div>
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
      </Container>
      <LoginModal />
      <RegisterModal />
      <UpdateModal />
    </MyNavbar>
  );
};

export default MenuNav;
