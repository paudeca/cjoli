import { CaretDownFill, CaretUpFill, PauseFill } from "react-bootstrap-icons";
import LeftCenterDiv from "../../../components/LeftCenterDiv";

interface CellValueProps<T> {
  value?: T;
  getLabel?: (a: T) => string | number | undefined;
  val: number | undefined;
  display: boolean;
}
const CellValue = <T,>({
  value,
  val,
  display,
  getLabel,
}: CellValueProps<T>) => {
  if (val == undefined || !display) {
    return "-";
  } else if (value && getLabel) {
    return getLabel(value);
  } else {
    return val;
  }
};

interface CellEvolutionProps {
  result: number;
  valB: number | undefined;
}

const CellEvolution = ({ result, valB }: CellEvolutionProps) => {
  if (result == 1) {
    return <CaretUpFill color="rgb(25, 135, 84)" className="mx-1" />;
  } else if (result == -1) {
    return <CaretDownFill color="rgb(220, 53, 69)" className="mx-1" />;
  } else if (!!valB && result == 0) {
    return <PauseFill style={{ transform: "rotate(90deg)" }} color="#ffc107" />;
  }
};

type TeamCellProps<T> = {
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
        <CellValue
          val={val}
          value={value}
          getLabel={getLabel}
          display={display}
        />
        {active && <CellEvolution result={result} valB={valB} />}
        <span className="mx-1" style={{ fontSize: 11, color: "grey" }}>
          {getInfo && value && display && getInfo(value)}
        </span>
      </LeftCenterDiv>
    </td>
  );
};

export default TeamCell;
