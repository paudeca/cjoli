import { Button, Input, Form } from "@heroui/react";
import { ReactNode, useCallback, useState } from "react";
import { Trans } from "react-i18next";
import {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";

export interface Field<T extends FieldValues> {
  id: Path<T>;
  label: string;
  placeholder?: string;
  type:
    | "text"
    | "password"
    | "date"
    | "datetime-local"
    | "number"
    | "select"
    | "switch";
  required?: boolean;
  validate?: { id: Path<T>; message: string };
  autoFocus?: boolean;
  creatable?: boolean;
  options?: { label: string; value: string | number }[];
  onChange?: (value?: string) => void;
  testId?: string;
}

export interface FormModalProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fields: Field<T>[];
  onSubmit: (data: T) => Promise<boolean>;
  onClose: () => void;
  children?: (field: Field<T>) => ReactNode;
}

export const CJoliForm = <T extends FieldValues>({
  form,
  fields,
  onSubmit,
  onClose,
  children,
}: FormModalProps<T>) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = form;

  const [running, setRunning] = useState(false);
  const submit: SubmitHandler<T> = useCallback(async (data) => {
    setRunning(true);
    const result = await onSubmit(data);
    if (result) {
      reset();
      onClose();
    }
    setRunning(false);
  }, []);
  const render = children
    ? children
    : (f: Field<T>) => (
        <Input
          key={f.id}
          isRequired={f.required}
          label={f.label}
          labelPlacement="outside"
          placeholder={f.placeholder}
          type={f.type}
          variant="bordered"
          autoFocus={f.autoFocus}
          isInvalid={!!errors[f.id]}
          errorMessage={errors[f.id]?.message as string}
          {...register(f.id, {
            validate: (value) =>
              f.validate && watch(f.validate.id) !== value
                ? f.validate.message
                : undefined,
          })}
        />
      );

  return (
    <Form
      className="flex flex-col gap-4"
      validationBehavior="native"
      onSubmit={handleSubmit(submit)}
    >
      {fields.map(render)}
      <Button
        className="w-full"
        color="primary"
        type="submit"
        isLoading={running}
      >
        <Trans i18nKey="button.submit">Submit</Trans>
      </Button>
    </Form>
  );
};
