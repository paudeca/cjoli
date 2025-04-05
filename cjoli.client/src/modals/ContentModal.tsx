import { Modal } from "react-bootstrap";
import { useModal } from "../hooks/useModal";
import { ReactNode } from "react";

interface ContentModalProps {
  id: string;
  title: string;
  children: ReactNode;
}
const ContentModal = ({ id, title, children }: ContentModalProps) => {
  const { show, setShow } = useModal(id);

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      keyboard={false}
      centered
      style={{ color: "black" }}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default ContentModal;
