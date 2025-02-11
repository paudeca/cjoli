import { Profiler, ReactNode } from "react";
import dayjs from "dayjs";

export const CJoliProfiler = ({
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
      onRender={(id, phase, actualDuration, baseDuration, startTime) => {
        console.log(
          `Profile[${id}] - ${phase}${
            phase == "mount" ? "🚩" : ""
          } ${actualDuration.toFixed(3)} ms - time:${Math.round(
            dayjs.duration(startTime).asMilliseconds()
          ).toFixed(1)} ms - base:${Math.round(
            dayjs.duration(baseDuration).asMilliseconds()
          ).toFixed(1)} ms`
        );
      }}
    >
      {children}
    </Profiler>
  );
};
