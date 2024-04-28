import { Fade, Modal, Form, Button, ProgressBar, Spinner } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { useModal } from "../contexts/ModalContext";
import * as cjoliService from "../services/cjoliService";
import { User } from "../models/User";
import { useCJoli } from "../contexts/CJoliContext";
import React from "react";
import { useToast } from "../contexts/ToastContext";

const UpdateModel = () => {
  const id = 'update';
  const { show, setShow } = useModal(id);
  const { loadUser } = useCJoli();
  const handleClose = () => setShow(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm<User>();
  const onSubmit: SubmitHandler<User> = async (user) => {
    setOpen(true);
    const result = await cjoliService.login(user);
    if (!result) {
      showToast("danger", "Invalid login");
    } else {
      user = await cjoliService.getUser();
      loadUser(user);
      handleClose();
    }
    setOpen(false);
  };
  const [open, setOpen] = React.useState(false);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop='static'
      keyboard={false}
      centered
      style={{ color: "black" }}
      autoFocus
      onShow={() => {
        resetField("login");
        resetField("password");
        setOpen(false);
      }}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className='mb-3' controlId='login'>
            <Form.Label>Login</Form.Label>
            <Form.Control type='text' autoFocus {...register("login", { required: "Login is required" })} className={`${errors.login ? "is-invalid" : ""}`} />
            <Form.Control.Feedback type='invalid'>{errors.login?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className='mb-3' controlId='password'>
            <Form.Label>Password</Form.Label>
            <Form.Control type='password' {...register("password", { required: "Password is required" })} className={`${errors.password ? "is-invalid" : ""}`} />
            <Form.Control.Feedback type='invalid'>{errors.password?.message}</Form.Control.Feedback>
          </Form.Group>
          <Fade in={open}>
            <ProgressBar now={100} animated />
          </Fade>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='primary' disabled={open}>
            Submit
            {open && <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' className='mx-2' />}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateModel;
