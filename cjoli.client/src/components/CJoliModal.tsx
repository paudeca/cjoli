import {
  Fade,
  Modal,
  Form,
  Button,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import { useForm, SubmitHandler, FieldValues, Path } from "react-hook-form";
import React from "react";
import { useModal } from "../hooks/useModal";
import { Trans, useTranslation } from "react-i18next";

export interface Field<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type: "text" | "password" | "date" | "number";
  required?: boolean;
  validate?: Path<T>;
  autoFocus?: boolean;
}

interface CJoliModalProps<T extends FieldValues> {
  id: string;
  title: string;
  fields: Field<T>[];
  onSubmit: (data: T) => Promise<boolean>;
  values?: T;
}

const CJoliModal = <T extends FieldValues>({
  id,
  title,
  fields,
  onSubmit,
  values,
}: CJoliModalProps<T>) => {
  const { show, setShow } = useModal(id);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    watch,
  } = useForm<T>({ values });

  const [running, setRunning] = React.useState(false);

  const submit: SubmitHandler<T> = async (data) => {
    setRunning(true);
    const result = await onSubmit(data);
    if (result) {
      setShow(false);
    }
    setRunning(false);
  };

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      backdrop="static"
      keyboard={false}
      centered
      style={{ color: "black" }}
      onShow={() => {
        fields.map((f) => resetField(f.id));
        setRunning(false);
      }}
    >
      <Form onSubmit={handleSubmit(submit)}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fields.map((f) => (
            <Form.Group key={f.id} className="mb-3" controlId={f.id as string}>
              <Form.Label>{f.label}</Form.Label>
              <Form.Control
                type={f.type}
                autoFocus={f.autoFocus}
                {...register(f.id, {
                  required: f.required
                    ? t("error.required", { field: f.label })
                    : false,
                  validate: (value) =>
                    f.validate && watch(f.validate) !== value
                      ? t("error.invalid", { field: f.label })
                      : undefined,
                })}
                className={`${errors[f.id] ? "is-invalid" : ""}`}
              />
              <Form.Control.Feedback type="invalid">
                {errors[f.id]?.message as string}
              </Form.Control.Feedback>
            </Form.Group>
          ))}
          <Fade in={running}>
            <ProgressBar now={100} animated />
          </Fade>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
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
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CJoliModal;
