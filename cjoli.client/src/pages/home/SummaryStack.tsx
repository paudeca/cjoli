import { Col, Fade, Row } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { Robot } from "react-bootstrap-icons";
import React from "react";
import * as cjoliService from "../../services/cjoliService";
import useUid from "../../hooks/useUid";
import Loader from "../../components/Loader";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

const SummaryStack = () => {
  const uid = useUid();
  const [message, setMessage] = React.useState<string>();
  const { i18n } = useTranslation();

  useQuery({
    queryKey: ["prompt"],
    queryFn: async () => {
      const response = await cjoliService.prompt(
        uid,
        i18n.resolvedLanguage || "en"
      );
      setMessage(response);
      return response;
    },
  });

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Row>
            <Col lg={1} xs={12}>
              <div className="py-2 px-4 border-bottom d-none d-lg-block">
                <div className="d-flex align-items-center py-1">
                  <div className="position-relative">
                    <Robot style={{ fontSize: 30 }} className="mx-2" />
                  </div>
                  <div className="flex-grow-1 pl-3">
                    <strong>BotAI</strong>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg xs className="m-3">
              {!message && (
                <Fade in={!message}>
                  <>
                    <Loader />
                    <Loader />
                    <Loader />
                  </>
                </Fade>
              )}
              {message && (
                <Fade in={!!message}>
                  <div
                    className="flex-shrink-1 bg-light rounded px-3 ml-3"
                    style={{ fontSize: "14px" }}
                    dangerouslySetInnerHTML={{
                      __html: message || "",
                    }}
                  ></div>
                </Fade>
              )}
            </Col>
          </Row>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default SummaryStack;
