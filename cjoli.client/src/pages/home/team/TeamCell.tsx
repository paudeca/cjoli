import { CaretDownFill, CaretUpFill, PauseFill } from "react-bootstrap-icons";
import LeftCenterDiv from "../../../components/LeftCenterDiv";

type TeamCellProps<T> = {
  label: string;
  value?: T;
  valueB?: T;
  call: (a: T) => number | undefined;
  getLabel?: (a: T) => string | number | undefined;
  getInfo?: (a: T) => string;
  up?: boolean;
  active: boolean;
  display: boolean;
};

const TeamCell = <T,>({
  value,
  valueB,
  call,
  getLabel,
  getInfo,
  up,
  active,
  display,
}: TeamCellProps<T>) => {
  const calcul = up
    ? (a: number, b: number) => (a > b ? 1 : a == b ? 0 : -1)
    : (a: number, b: number) => (a < b ? 1 : a == b ? 0 : -1);
  const val = value && call(value);
  const valB = valueB && call(valueB);
  const result =
    val == undefined || !valueB || valB == undefined ? 0 : calcul(val, valB);
  return (
    <td>
      <LeftCenterDiv width={40}>
        {val === undefined || !display
          ? "-"
          : value && getLabel
          ? getLabel(value)
          : val}
        {active && result == 1 && (
          <CaretUpFill color="rgb(25, 135, 84)" className="mx-1" />
        )}
        {active && result == -1 && (
          <CaretDownFill color="rgb(220, 53, 69)" className="mx-1" />
        )}
        {active && !!valB && result == 0 && (
          <PauseFill style={{ transform: "rotate(90deg)" }} color="#ffc107" />
        )}
        <span className="mx-1" style={{ fontSize: 11, color: "grey" }}>
          {getInfo && value && display && getInfo(value)}
        </span>
      </LeftCenterDiv>
    </td>
  );
};

export default TeamCell;
