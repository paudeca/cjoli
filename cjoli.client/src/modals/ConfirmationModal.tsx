import { Button, Fade, Modal, ProgressBar, Spinner } from "react-bootstrap";
import { useModal } from "../hooks/useModal";
import React, { ReactNode } from "react";
import { Trans } from "react-i18next";

interface ConfirmationModalProps {
  id: string;
  title: string;
  children: ReactNode;
  onConfirm: () => Promise<boolean>;
}

const ConfirmationModal = ({
  id,
  title,
  children,
  onConfirm,
}: ConfirmationModalProps) => {
  const { show, setShow } = useModal(id);
  const [running, setRunning] = React.useState(false);

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      backdrop="static"
      keyboard={false}
      centered
      style={{ color: "black" }}
      onShow={() => {
        setRunning(false);
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
        <Fade in={running}>
          <ProgressBar now={100} animated />
        </Fade>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={() => setShow(false)}
          style={{ width: 80 }}
        >
          <Trans i18nKey="button.no">No</Trans>
        </Button>
        <Button
          type="submit"
          variant="primary"
          onClick={async () => {
            if (await onConfirm()) {
              setShow(false);
            }
          }}
          style={{ width: 80 }}
          disabled={running}
        >
          <Trans i18nKey="button.yes">Yes</Trans>
          {running && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="mx-2"
            />
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
