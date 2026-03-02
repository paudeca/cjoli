import { Modal, Button, Spinner } from "react-bootstrap";
import { ReactNode } from "react";
import { useModal } from "../../hooks/useModal";
import { Trans } from "react-i18next";

const BasicModal = ({
  id,
  title,
  children,
  onSubmit,
}: {
  id: string;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
}) => {
  const { show, setShow } = useModal(id);

  const running = false;

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      backdrop="static"
      keyboard={false}
      centered
      style={{ color: "black" }}
    >
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        {onSubmit && (
          <>
            <Button onClick={() => setShow(false)} variant={`outline-primary`}>
              <Trans i18nKey="button.cancel">Cancel</Trans>
            </Button>
            <Button type="submit" variant="primary" disabled={running}>
              <Trans i18nKey="button.submit">Submit</Trans>
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
          </>
        )}
        {!onSubmit && (
          <Button onClick={() => setShow(false)} variant={`outline-primary`}>
            <Trans i18nKey="button.close">Close</Trans>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BasicModal;
