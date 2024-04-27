import { Modal, Form, Button } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { useModal } from "../contexts/ModalContext";

type Login = {
  login: string;
  password: string;
};

const RegisterModal = ({ id }: { id: string }) => {
  const { show, setShow } = useModal(id);
  const handleClose = () => setShow(false);

  const { register, handleSubmit } = useForm<Login>();
  const onSubmit: SubmitHandler<Login> = (data) => {
    console.log(data);
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false} centered style={{ color: "black" }}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className='mb-3' controlId='login'>
            <Form.Label>Login</Form.Label>
            <Form.Control type='text' autoFocus {...register("login")} />
          </Form.Group>
          <Form.Group className='mb-3' controlId='password'>
            <Form.Label>Password</Form.Label>
            <Form.Control type='password' {...register("password")} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='primary'>
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RegisterModal;
