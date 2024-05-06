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
import { useModal } from "../contexts/ModalContext";
import styled from "@emotion/styled";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import UpdateModal from "../modals/UpdateModal";
import * as cjoliService from "../services/cjoliService";
import { Bezier2, PersonSquare } from "react-bootstrap-icons";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import useScreenSize from "../hooks/useScreenSize";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import React from "react";
import { useForm } from "react-hook-form";
import { User, UserConfig } from "../models";

const MyImg = styled.img<{ width: string }>`
  width: ${(props) => props.width};
`;

const MenuNav = () => {
  const { loadRanking, tourney } = useCJoli();
  const {
    user,
    userConfig,
    userConfig: { activeSimulation },
    isAdmin,
    loadUser,
  } = useUser();
  const uid = useUid();
  const { setShow: showLogin } = useModal("login");
  const { setShow: showRegister } = useModal("register");
  const { setShow: showUpdate } = useModal("update");
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const logout = async () => {
    await cjoliService.logout();
    loadUser(undefined);
    if (uid) {
      const ranking = await cjoliService.getRanking(uid);
      loadRanking(ranking);
    }
  };
  const [loading, setLoading] = React.useState(false);

  const { register } = useForm<UserConfig>({
    values: userConfig,
  });

  const handleUpdateSimulation = async () => {
    setLoading(true);
    const ranking = await cjoliService.updateSimulation(uid);
    loadRanking(ranking);
    handleSaveUserConfig({ ...userConfig, useCustomSimulation: true });
    setLoading(false);
  };
  const handleSaveUserConfig = async (userConfig: UserConfig) => {
    const ranking = await cjoliService.saveUserConfig(uid, userConfig);
    loadRanking(ranking);
    const configs =
      user?.configs?.map((c) =>
        c.tourneyId == userConfig.tourneyId ? userConfig : c
      ) || [];
    loadUser({ ...user, configs } as User);
  };
  const tourneyLabel = uid && tourney?.name;
  return (
    <Navbar
      expand="sm"
      className="bg-body-tertiary mb-3"
      sticky="top"
      style={{ color: "black" }}
    >
      <Container fluid>
        <Navbar.Brand>
          <Row>
            <Col>
              <MyImg
                src="./logo.png"
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
                  Active Simulation
                  <Bezier2 className="mx-2" />
                </>
              }
              {...register("activeSimulation", {
                onChange: (e: React.FormEvent<HTMLInputElement>) =>
                  handleSaveUserConfig({
                    ...userConfig,
                    activeSimulation: e.currentTarget.checked,
                  }),
              })}
            />
            {activeSimulation && (
              <>
                <Button onClick={handleUpdateSimulation} disabled={loading}>
                  Refresh simulations
                  {!loading && <Bezier2 className="mx-2" size={20} />}
                  {loading && (
                    <Spinner animation="grow" className="mx-2" size="sm" />
                  )}
                </Button>
                {!isAdmin && (
                  <Form.Check
                    type="switch"
                    label="Use Custom"
                    role="button"
                    {...register("useCustomSimulation", {
                      onChange: (e: React.FormEvent<HTMLInputElement>) =>
                        handleSaveUserConfig({
                          ...userConfig,
                          useCustomSimulation: e.currentTarget.checked,
                        }),
                    })}
                  />
                )}
              </>
            )}
          </Stack>
        )}
        <Navbar.Toggle aria-controls="menu" />
        <Navbar.Offcanvas id="menu" aria-labelledby="menu" placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <NavDropdown
                title={
                  <>
                    <PersonSquare size={30} className="mx-2" />
                    <span>{user?.login || "Visitor"}</span>
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
