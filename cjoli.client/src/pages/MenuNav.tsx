import { Navbar, Container, Offcanvas, Nav, NavDropdown } from "react-bootstrap";
import { ModalProvider, useModal } from "../contexts/ModalContext";
import styled from "@emotion/styled";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import UpdateModal from "../modals/UpdateModal";
import { useCJoli } from "../contexts/CJoliContext";
import * as cjoliService from "../services/cjoliService";

const MyImg = styled.img<{ width: string }>`
  width: ${(props) => props.width};
`;

const MenuNav = () => {
  const {
    state: { user },
    loadUser,
  } = useCJoli();
  const { setShow: showLogin } = useModal("login");
  const { setShow: showRegister } = useModal("register");
  const { setShow: showUpdate } = useModal("update");
  const logout = () => {
    cjoliService.logout();
    loadUser(undefined);
  };
  return (
    <Navbar expand='sm' className='bg-body-tertiary mb-3' sticky='top'>
      <Container fluid>
        <Navbar.Brand href='#'>
          <MyImg src='./logo.png' width='60px' className='mx-4' />
          CJoli - Ice Hockey Tournament
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='menu' />
        <Navbar.Offcanvas id='menu' aria-labelledby='menu' placement='end'>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className='justify-content-end flex-grow-1 pe-3'>
              <NavDropdown
                title={
                  <>
                    <MyImg src='./user.png' width='30px' className='mx-2' />
                    <span>{user?.login || "Visitor"}</span>
                  </>
                }
                className='px-0'
                style={{ minWidth: "140px" }}
                align='end'
              >
                {!user && (
                  <>
                    <NavDropdown.Item onClick={() => showLogin(true)}>Login</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => showRegister(true)}>Register</NavDropdown.Item>
                  </>
                )}

                {user && (
                  <>
                    <NavDropdown.Item onClick={() => showUpdate(true)}>Update</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
      <LoginModal id='login' />
      <RegisterModal id='register' />
      <UpdateModal id='update' />
    </Navbar>
  );
};

export default () => (
  <ModalProvider>
    <MenuNav />
  </ModalProvider>
);
