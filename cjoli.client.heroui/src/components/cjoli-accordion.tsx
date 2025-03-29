import { Accordion, AccordionItem } from "@heroui/react";
import { ReactNode } from "react";

type Item = {
  key: string;
  title?: string;
  hide?: boolean;
  defaultExpanded?: boolean;
};

interface CJoliAccordionProps<T> {
  items: T[];
  children: (item: T) => ReactNode;
  mode?: "multiple" | "single";
  variant?: "splitted" | "light";
  colorHeader?: boolean;
}

export const CjoliAccordion = <T extends Item>({
  items,
  children,
  mode,
  variant,
  colorHeader,
}: CJoliAccordionProps<T>) => {
  const keys = items
    .filter((i) => !i.hide && i.defaultExpanded)
    .map((i) => i.key);
  return (
    <Accordion
      variant={variant ?? "splitted"}
      selectionMode={mode ?? "multiple"}
      defaultExpandedKeys={keys}
      itemClasses={
        colorHeader
          ? {
              heading: "data-[open]:bg-secondary px-5",
              title: "data-[open]:text-background",
              indicator: "data-[open]:text-background",
            }
          : {}
      }
    >
      {items
        .filter((i) => !i.hide)
        .map((item) => (
          <AccordionItem
            key={item.key}
            title={<span className="font-semibold">{item.title}</span>}
            aria-label={item.title}
            className="p-2 md:p-4"
          >
            {children(item)}
          </AccordionItem>
        ))}
    </Accordion>
  );
};
