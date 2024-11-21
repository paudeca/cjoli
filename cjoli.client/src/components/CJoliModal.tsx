import {
  Fade,
  Modal,
  Form,
  Button,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { useEffect, useState } from "react";
import { useModal } from "../hooks/useModal";
import { Trans, useTranslation } from "react-i18next";
import CreatableSelect from "react-select/creatable";
import Select, { SingleValue } from "react-select";

export interface Field<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type:
    | "text"
    | "password"
    | "date"
    | "datetime-local"
    | "number"
    | "select"
    | "switch";
  required?: boolean;
  validate?: Path<T>;
  autoFocus?: boolean;
  creatable?: boolean;
  options?: { label: string; value: string | number }[];
  onChange?: (value?: string) => void;
}

interface CJoliModalProps<T extends FieldValues> {
  id: string;
  title: string;
  fields: Field<T>[];
  onSubmit: (data: T) => Promise<boolean>;
  values?: Partial<T>;
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
    setValue,
    handleSubmit,
    formState: { errors },
    resetField,
    watch,
    setFocus,
  } = useForm<T>({ values: values as T });

  const [running, setRunning] = useState(false);

  const focusField = fields.find((f) => f.autoFocus);
  useEffect(() => {
    focusField && show && setFocus(focusField.id);
  }, [focusField, show, setFocus]);

  const submit: SubmitHandler<T> = async (data) => {
    setRunning(true);
    const result = await onSubmit(data);
    if (result) {
      setShow(false);
    }
    setRunning(false);
  };

  const createInput = (f: Field<T>) => {
    switch (f.type) {
      case "select": {
        const onChange = (
          v: SingleValue<{ label: string; value: string | number }>
        ) => {
          console.log("on change select");
          const value = v?.value as PathValue<T, Path<T>>;
          setValue(f.id, value);
          f.onChange && f.onChange(value);
        };
        return f.creatable ? (
          <CreatableSelect
            id={f.id}
            options={f.options}
            onChange={onChange}
            aria-label={f.id}
            aria-labelledby={f.id}
            isClearable
            defaultValue={f.options?.find(
              (o) => values && o.value == values[f.id]
            )}
          />
        ) : (
          <Select
            options={f.options}
            onChange={onChange}
            isClearable
            defaultValue={f.options?.find(
              (o) => values && o.value == values[f.id]
            )}
          />
        );
      }
      case "switch":
        return (
          <Form.Check
            type="switch"
            label={f.label}
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
        );
      default:
        return (
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
        );
    }
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
              {createInput(f)}
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
