import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Button,
  ModalHeader,
} from "@heroui/react";
import { ReactNode } from "react";
import { Trans } from "react-i18next";

export interface CJoliModalProps {
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
}: CJoliModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="md"
    >
      <ModalContent className="cjoli text-foreground bg-background">
        {(onClose) => (
          <>
            {title && <ModalHeader>{title}</ModalHeader>}
            <ModalBody>
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex w-full flex-col gap-2 rounded-large py-8 px-0">
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
