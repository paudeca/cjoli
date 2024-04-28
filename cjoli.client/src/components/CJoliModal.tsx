import { Fade, Modal, Form, Button, ProgressBar, Spinner } from "react-bootstrap";
import { useForm, SubmitHandler, FieldValues, Path } from "react-hook-form";
import { useModal } from "../contexts/ModalContext";
import * as cjoliService from "../services/cjoliService";
import { useCJoli } from "../contexts/CJoliContext";
import React from "react";
import { useToast } from "../contexts/ToastContext";

interface Field<T extends FieldValues> {
  id: keyof T;
  label: string;
  type: "text" | "password";
  required?: boolean;
}

interface CJoliModalProps<T extends FieldValues> {
  id: string;
  title: string;
  fields: Field<T>[];
}

function CJoliModal<T extends FieldValues>({ id, title, fields }: CJoliModalProps<T>) {
  const { show, setShow } = useModal(id);
  const { loadUser } = useCJoli();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm<T>();

  const [running, setRunning] = React.useState(false);

  const onSubmit: SubmitHandler<T> = async (user) => {
    setRunning(true);
    const result = await cjoliService.login(user);
    if (!result) {
      showToast("danger", "Invalid login");
    } else {
      user = await cjoliService.getUser();
      loadUser(user);
      setShow(false);
    }
    setRunning(false);
  };

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      backdrop='static'
      keyboard={false}
      centered
      style={{ color: "black" }}
      autoFocus
      onShow={() => {
        fields.map((f) => resetField(f.id as Path<T>));
        setRunning(false);
      }}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fields.map((f) => (
            <Form.Group className='mb-3' controlId={f.id as string}>
              <Form.Label>{f.label}</Form.Label>
              <Form.Control
                type={f.type}
                autoFocus
                {...register(f.id as Path<T>, { required: f.required ? `${f.label} is required` : false })}
                className={`${errors[f.id] ? "is-invalid" : ""}`}
              />
              <Form.Control.Feedback type='invalid'>{errors[f.id]?.message as string}</Form.Control.Feedback>
            </Form.Group>
          ))}
          <Fade in={running}>
            <ProgressBar now={100} animated />
          </Fade>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button type='submit' variant='primary' disabled={running}>
            Submit
            {running && <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' className='mx-2' />}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CJoliModal;
