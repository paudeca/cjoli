import { Navbar, Container, Offcanvas, Nav, NavDropdown } from "react-bootstrap";
import { ModalProvider, useModal } from "../contexts/ModalContext";
import styled from "@emotion/styled";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";

const MyImg = styled.img<{ width: string }>`
  width: ${(props) => props.width};
`;

const MenuNav = () => {
  const { setShow } = useModal("login");
  const { setShow: setShowRegister } = useModal("register");
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
                    <span>Visitor</span>
                  </>
                }
                className='px-0'
                style={{ minWidth: "140px" }}
                align='end'
              >
                <NavDropdown.Item onClick={() => setShow(true)}>Login</NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowRegister(true)}>Register</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
      <LoginModal id='login' />
      <RegisterModal id='register' />
    </Navbar>
  );
};

export default () => (
  <ModalProvider>
    <MenuNav />
  </ModalProvider>
);
