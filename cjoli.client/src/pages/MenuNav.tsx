import {
  Navbar,
  Container,
  Offcanvas,
  Nav,
  NavDropdown,
  Col,
  Row,
} from "react-bootstrap";
import { useModal } from "../contexts/ModalContext";
import styled from "@emotion/styled";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import UpdateModal from "../modals/UpdateModal";
import * as cjoliService from "../services/cjoliService";
import { PersonSquare } from "react-bootstrap-icons";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import useScreenSize from "../hooks/useScreenSize";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";

const MyImg = styled.img<{ width: string }>`
  width: ${(props) => props.width};
`;

const MenuNav = () => {
  const { loadRanking } = useCJoli();
  const { user, loadUser } = useUser();
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
  return (
    <Navbar expand="sm" className="bg-body-tertiary mb-3" sticky="top">
      <Container fluid>
        <Navbar.Brand onClick={() => navigate("/")}>
          <Row>
            <Col>
              <MyImg src="./logo.png" width="60px" className="mx-4" />
            </Col>
            {isMobile && <Col>Ice Hockey</Col>}
            {!isMobile && <Col>CJoli - Ice Hockey Tournament - 1.0.0</Col>}
          </Row>
        </Navbar.Brand>
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
