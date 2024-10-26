import { Button, Fade, Modal, ProgressBar, Spinner } from "react-bootstrap";
import { useModal } from "../hooks/useModal";
import React, { ReactNode } from "react";
import { Trans } from "react-i18next";

interface ConfirmationModalProps<T> {
  id: string;
  title: string;
  children?: ReactNode;
  message?: (data: T) => ReactNode;
  onConfirm: (data: T) => Promise<boolean>;
}

const ConfirmationModal = <T,>({
  id,
  title,
  children,
  message,
  onConfirm,
}: ConfirmationModalProps<T>) => {
  const { show, setShow, data } = useModal<T>(id);
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
        {message && data ? message(data) : children}
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
            if (data && (await onConfirm(data))) {
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
