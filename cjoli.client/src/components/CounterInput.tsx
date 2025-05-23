import { Badge } from "react-bootstrap";
import { Dash, Plus } from "react-bootstrap-icons";

interface CounterInputProps {
  count: number;
  onChange: (count: number) => void;
}
const CounterInput = ({ count, onChange }: CounterInputProps) => {
  return (
    <h5>
      <Badge pill bg="secondary" className="user-select-none">
        <Dash
          onClick={() => {
            onChange(count > 1 ? count - 1 : 0);
          }}
          role="button"
        />
        <span className="mx-1">{count}P</span>
        <Plus
          onClick={() => {
            onChange(count + 1);
          }}
          role="button"
        />
      </Badge>
    </h5>
  );
};

export default CounterInput;
