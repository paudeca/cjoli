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
} from "react-bootstrap";
import styled from "@emotion/styled";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import UpdateModal from "../modals/UpdateModal";
import * as cjoliService from "../services/cjoliService";
import { Bezier2, House, ListOl, PersonSquare } from "react-bootstrap-icons";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import useScreenSize from "../hooks/useScreenSize";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import React from "react";
import { useForm } from "react-hook-form";
import { useEstimate } from "../hooks/useEstimate";
import { UserConfig } from "../models";
import { useModal } from "../hooks/useModal";

const MyImg = styled.img<{ width: string }>`
  width: ${(props) => props.width};
`;

const MenuNav = () => {
  const { loadRanking, tourney } = useCJoli();
  const {
    user,
    userConfig,
    userConfig: { activeEstimate },
    loadUser,
    handleSaveUserConfig,
  } = useUser();
  const uid = useUid();
  const { setShow: showLogin } = useModal("login");
  const { setShow: showRegister } = useModal("register");
  const { setShow: showUpdate } = useModal("update");
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const { loading, handleUpdateEstimate } = useEstimate();

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

  const { register } = useForm<UserConfig>({
    values: userConfig,
  });

  const tourneyLabel = uid && tourney?.name;
  return (
    <Navbar
      expand="sm"
      className="bg-body-tertiary mb-3"
      sticky={isMobile ? undefined : "top"}
      style={{ color: "black" }}
    >
      <Container fluid>
        <Navbar.Brand>
          <Row>
            <Col>
              <MyImg
                src="/logo.png"
                width="60px"
                className="mx-4"
                onClick={() => navigate("/")}
                role="button"
              />
            </Col>
            {!tourneyLabel && isMobile && <Col>Ice Hockey</Col>}
            {!tourneyLabel && !isMobile && (
              <Col>CJoli - Ice Hockey Tournament - 1.0.0</Col>
            )}
            {tourneyLabel && <Col>{tourneyLabel}</Col>}
          </Row>
        </Navbar.Brand>
        {user && tourneyLabel && (
          <Stack direction="horizontal" gap={3}>
            <Form.Check
              type="switch"
              role="button"
              label={
                <>
                  Active
                  {!isMobile && <Bezier2 className="mx-2" />}
                </>
              }
              {...register("activeEstimate", {
                onChange: (e: React.FormEvent<HTMLInputElement>) =>
                  handleSaveUserConfig({
                    ...userConfig,
                    activeEstimate: e.currentTarget.checked,
                  }),
              })}
            />
            {activeEstimate && (
              <>
                <Button onClick={handleUpdateEstimate} disabled={loading}>
                  {isMobile ? "Refresh" : "Refresh estimate"}
                  {!loading && <Bezier2 className="mx-2" size={20} />}
                  {loading && (
                    <Spinner animation="grow" className="mx-2" size="sm" />
                  )}
                </Button>
                <Form.Check
                  type="switch"
                  label={isMobile ? "Custom" : "Use custom"}
                  role="button"
                  {...register("useCustomEstimate", {
                    onChange: (e: React.FormEvent<HTMLInputElement>) =>
                      handleSaveUserConfig({
                        ...userConfig,
                        useCustomEstimate: e.currentTarget.checked,
                      }),
                  })}
                />
              </>
            )}
          </Stack>
        )}
        <Navbar.Toggle aria-controls="menu" onClick={() => setShow(true)} />
        <Navbar.Offcanvas
          id="menu"
          aria-labelledby="menu"
          placement="end"
          show={show}
          onShow={() => setShow(true)}
        >
          <Offcanvas.Header closeButton onClick={() => setShow(false)}>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              {uid && (
                <>
                  <Nav.Link
                    onClick={() => {
                      navigate(`${uid}`);
                      setShow(false);
                    }}
                  >
                    <House size={30} className="mx-2" />
                    Home
                  </Nav.Link>
                  <Nav.Link
                    onClick={() => {
                      navigate(`${uid}/ranking`);
                      setShow(false);
                    }}
                  >
                    <ListOl size={30} className="mx-2" />
                    Ranking
                  </Nav.Link>
                </>
              )}
              <NavDropdown
                title={
                  <>
                    <PersonSquare size={30} className="mx-2" />
                    <span>{user?.login || "Guest"}</span>
                  </>
                }
                className="px-0"
                style={{ minWidth: "140px" }}
                align="end"
              >
                {!user && (
                  <>
                    <NavDropdown.Item onClick={() => showLogin(true)}>
                      Login
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => showRegister(true)}>
                      Register
                    </NavDropdown.Item>
                  </>
                )}

                {user && (
                  <>
                    <NavDropdown.Item onClick={() => showUpdate(true)}>
                      Update
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
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
    </Navbar>
  );
};

export default MenuNav;
