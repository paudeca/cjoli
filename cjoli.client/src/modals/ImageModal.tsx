import { Modal } from "react-bootstrap";
import { useModal } from "../hooks/useModal";

const ImageModal = () => {
  const { show, setShow, data } = useModal<string>("image");

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      keyboard={false}
      centered
      style={{ color: "black" }}
      size="lg"
    >
      <img className="w-100 h-100" src={data} onClick={() => setShow(false)} />
    </Modal>
  );
};

export default ImageModal;
