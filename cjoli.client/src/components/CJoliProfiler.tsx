import { Profiler, ReactNode } from "react";
import dayjs from "dayjs";

const CJoliProfiler = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  return (
    <Profiler
      id={id}
      // eslint-disable-next-line max-params
      onRender={(id, phase, actualDuration, _baseDuration, startTime) => {
        console.log(
          `Profile[${id}] - ${phase}${
            phase == "mount" ? "🚩" : ""
          } ${actualDuration.toFixed(3)} ms - time:${Math.round(
            dayjs.duration(startTime).asSeconds()
          ).toFixed(1)} s`
        );
      }}
    >
      {children}
    </Profiler>
  );
};

export default CJoliProfiler;
