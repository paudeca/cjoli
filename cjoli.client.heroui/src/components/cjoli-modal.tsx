import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Button,
} from "@heroui/react";
import { ReactNode } from "react";
import { Trans } from "react-i18next";

export interface FormModalProps {
  title?: string;
  isOpen: boolean;
  onOpenChange: () => void;
  children: ReactNode;
}

export const CJoliModal = ({
  title,
  isOpen,
  onOpenChange,
  children,
}: FormModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent className="cjoli text-foreground bg-background">
        {(onClose) => (
          <>
            <ModalBody>
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex w-full max-w-sm flex-col gap-2 rounded-large py-8 px-0">
                  {title && (
                    <p className="pb-4 text-left text-3xl font-semibold">
                      {title}
                    </p>
                  )}
                  {children}
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
