import { Button, Chip } from "@heroui/react";
import { MinusIcon, PlusIcon } from "../icons";
import { FC } from "react";

interface CounterInputProps {
  count: number;
  onChange: (count: number) => void;
}

export const CounterInput: FC<CounterInputProps> = ({ count, onChange }) => {
  return (
    <Chip
      startContent={
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={() => onChange(count - 1)}
        >
          <MinusIcon size={20} />
        </Button>
      }
      endContent={
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={() => onChange(count + 1)}
        >
          <PlusIcon size={1} />
        </Button>
      }
    >
      {count}P
    </Chip>
  );
};
