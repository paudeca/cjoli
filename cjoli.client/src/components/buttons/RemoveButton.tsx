import { Trash3 } from "react-bootstrap-icons";
import ButtonLoading from "./ButtonLoading";

export const RemoveButton = ({
  handleRemove,
}: {
  handleRemove: () => Promise<void>;
}) => {
  return (
    <ButtonLoading variant="danger" onClick={handleRemove}>
      <Trash3 />
    </ButtonLoading>
  );
};
