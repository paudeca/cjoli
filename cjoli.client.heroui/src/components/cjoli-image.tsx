import { Image } from "@heroui/react";

export const CJoliImage = ({ size = 30, ...props }) => (
  <Image {...props} className={`max-w-[${size}px] max-h-[${size}px]`} />
);
