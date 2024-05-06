import { Modal, Button, Alert } from "react-bootstrap";
import { useModal } from "../contexts/ModalContext";
import React, { ReactNode } from "react";

const InfoModal = ({
  id,
  title,
  variant,
  children,
}: {
  id: string;
  title: string;
  variant: string;
  children: ReactNode;
}) => {
  const { show, setShow } = useModal(id);

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      backdrop="static"
      keyboard={false}
      centered
      style={{ color: "black" }}
    >
      <Modal.Body>
        <Alert variant="danger">
          <Alert.Heading>{title}</Alert.Heading>
          {children}
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              onClick={() => setShow(false)}
              variant={`outline-${variant}`}
            >
              Close
            </Button>
          </div>
        </Alert>
      </Modal.Body>
    </Modal>
  );
};

export default InfoModal;
