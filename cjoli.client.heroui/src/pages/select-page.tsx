import { CjoliAccordion } from "@/components";
import { CJoliLoading } from "@/components/cjoli-loading";
import { useSelectPage } from "@/hooks";
import { DefaultLayout } from "@/layouts/default-layout";
import { useTools } from "@cjoli/core";
import { Avatar, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const SelectPage = () => {
  const { formatDate } = useTools();
  const { datas, goTourney, loaded } = useSelectPage();

  return (
    <DefaultLayout>
      <CJoliLoading loading={!loaded}>
        <CjoliAccordion items={datas}>
          {(item) => (
            <div className="gap-4 grid grid-cols sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {item.tourneys.map((t) => (
                <Card
                  key={t.id}
                  className="max-w-[400px]"
                  isPressable
                  onPress={() => goTourney(t)}
                >
                  <CardHeader className="gap-3 bg-secondary-400 text-foreground">
                    <Avatar
                      name={t.name}
                      radius="sm"
                      isBordered
                      color="primary"
                      src=""
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
          )}
        </CjoliAccordion>
      </CJoliLoading>
    </DefaultLayout>
  );
};
