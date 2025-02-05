import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  Form,
  Progress,
} from "@heroui/react";
import { ReactNode, useCallback, useState } from "react";
import { Trans } from "react-i18next";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Field } from ".";

export interface FormModalProps<T extends FieldValues> {
  title: string;
  fields: Field<T>[];
  onSubmit: (data: T) => Promise<boolean>;
  footer?: ReactNode;
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
}

export const FormModal = <T extends FieldValues>({
  title,
  fields,
  onSubmit,
  footer,
  isOpen,
  onOpenChange,
  onClose,
}: FormModalProps<T>) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<T>();

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
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        reset();
        onOpenChange();
      }}
      backdrop="blur"
    >
      <ModalContent className="cjoli text-foreground bg-background">
        {(onClose) => (
          <>
            <ModalBody>
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex w-full max-w-sm flex-col gap-4 rounded-large px-8 pb-10 pt-6">
                  <p className="pb-4 text-left text-3xl font-semibold">
                    {title}
                  </p>
                  <Form
                    className="flex flex-col gap-4"
                    validationBehavior="native"
                    onSubmit={handleSubmit(submit)}
                  >
                    {fields.map((f) => (
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
                    ))}
                    <Button
                      className="w-full"
                      color="primary"
                      type="submit"
                      isDisabled={running}
                    >
                      <Trans i18nKey="button.submit">Submit</Trans>
                    </Button>
                    {running && (
                      <Progress
                        isIndeterminate
                        aria-label="Loading..."
                        className="max-w-md"
                        size="sm"
                        color="danger"
                      />
                    )}
                  </Form>
                  {footer}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                <Trans i18nKey="button.close">Close</Trans>
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
