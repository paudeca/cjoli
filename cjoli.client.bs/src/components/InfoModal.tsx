import { Modal, Button, Alert } from "react-bootstrap";
import { ReactNode } from "react";
import { useModal } from "../hooks/useModal";
import { Trans } from "react-i18next";

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
              <Trans i18nKey="button.close">Close</Trans>
            </Button>
          </div>
        </Alert>
      </Modal.Body>
    </Modal>
  );
};

export default InfoModal;
