import { CJoliLoading } from "@/components/cjoli-loading";
import { useSelectPage } from "@/hooks";
import { useTools } from "@cjoli/core";
import { Avatar, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const SelectPage = () => {
  const { formatDate } = useTools();
  const { datas, goTourney, loaded } = useSelectPage();

  return (
    <CJoliLoading loading={!loaded}>
      {datas.map((d) => (
        <Card key={d.key} className="m-2 pb-2 px-2 md:m-4 md:pb-4">
          <CardHeader>{d.title}</CardHeader>
          <Divider />
          <CardBody>
            <div className="gap-4 grid grid-cols sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {d.tourneys.map((t) => (
                <Card key={t.id} isPressable onPress={() => goTourney(t)}>
                  <CardHeader className="gap-3 bg-secondary-400 text-foreground">
                    <Avatar
                      name={t.name}
                      size="lg"
                      radius="sm"
                      isBordered
                      color="primary"
                      src={t.logo}
                      classNames={{
                        icon: "text-black/80",
                        name: "text-xl subpixel-antialiased",
                      }}
                    />
                    <div className="flex flex-col items-start text-left">
                      <span className="text-large tracking-tight inline font-semibold text-background text-nowrap truncate w-50">
                        {t.name}
                      </span>

                      <div className="text-xs text-background/80">
                        {t.season}
                      </div>
                      <div className="text-xs text-background/80">
                        {t.category}
                      </div>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <p className="text-xs">
                      {formatDate(t.startTime)} -{" "}
                      {formatDate(t.endTime, { upper: false })}
                    </p>
                    <p className="text-xs text-right">
                      {dayjs(t.startTime).fromNow()}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </CJoliLoading>
  );
};
