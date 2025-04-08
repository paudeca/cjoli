/* eslint-disable max-lines */
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Pagination,
  Row,
  Stack,
} from "react-bootstrap";
import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import { useCJoli } from "../hooks/useCJoli";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { useServer } from "../hooks/useServer";
import { useApi } from "../hooks/useApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import useUid from "../hooks/useUid";
import { useModal } from "../hooks/useModal";
import useScreenSize from "../hooks/useScreenSize";
import { useUser } from "../hooks/useUser";
import CJoliTabs from "../components/CJoliTabs";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Message } from "../models";
import { Trans } from "react-i18next";
import { Image } from "react-bootstrap-icons";

/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
const GalleryPage = () => {
  const { gallery } = useCJoli("gallery");
  const { register, path } = useServer();
  const { getGallery, updateMessage, deleteMessage } = useApi();
  const uid = useUid();
  const { setShowWithData: showImage } = useModal<string>("image");
  const { setShowWithData: showConfirmDeleteMessage } = useModal<Message>(
    "confirmDeleteMessage"
  );
  const { setShow: showUploadImage } = useModal("uploadImage");

  const { isMobile } = useScreenSize();
  const { isAdmin } = useUser();
  const { mode } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(gallery?.page ?? 0);
  const { isLoading, refetch } = useQuery(
    getGallery(uid, page, mode == "waiting", false)
  );

  const { mutate: doUpdateMessage } = useMutation(
    updateMessage({
      uid,
      onSuccess: refetch,
    })
  );
  const { mutate: doDeleteMessage } = useMutation(
    deleteMessage({
      uid,
      onSuccess: refetch,
    })
  );

  useEffect(() => {
    register("updateRanking", async () => {
      refetch();
    });
  }, [register, refetch]);

  const count = isMobile ? 2 : 4;
  const messages =
    gallery?.messages.map((m, i) => ({ ...m, col: i % count })) ?? [];

  const total = gallery?.total ?? 0;
  const totalWaiting = gallery?.totalWaiting ?? 0;
  const pageSize = gallery?.pageSize ?? 1;
  const pages = Math.ceil(total / pageSize);

  return (
    <Loading ready={!isLoading}>
      <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
        {isAdmin && (
          <CJoliTabs
            tabs={[
              { id: "gallery", label: "Gallery" },
              {
                id: "waiting",
                label: (
                  <span>
                    Waiting{" "}
                    {totalWaiting > 0 && (
                      <Badge bg="warning" text="black">
                        {totalWaiting}
                      </Badge>
                    )}
                  </span>
                ),
              },
            ]}
            onSelect={(key) => navigate(`${path}gallery/${key}`)}
            defaultKey={mode}
          />
        )}

        <div className="p-2">
          <CJoliCard>
            <Card.Body>
              <Container>
                {mode != "waiting" && (
                  <Row className="mb-4">
                    <Col>
                      <Button
                        variant="success"
                        className="d-flex align-items-center"
                        onClick={() => showUploadImage(true)}
                      >
                        <Trans i18nKey="gallery.sendPhoto">
                          Send your best photos
                        </Trans>
                        <Image className="mx-2" />
                      </Button>
                    </Col>
                  </Row>
                )}
                {messages.length == 0 && (
                  <Row>
                    <Col>
                      <Alert variant="warning" className="mb-0">
                        <Trans i18nKey="home.noImage">
                          No photos for the tourney
                        </Trans>
                      </Alert>
                    </Col>
                  </Row>
                )}

                <Row>
                  {[...Array(count).keys()].map((i) => (
                    <Col key={i} xs={12 / count}>
                      {messages
                        .filter((m) => m.col == i)
                        .map((m) => (
                          <div key={m.id} className="mb-4">
                            <img
                              src={m.mediaUrl}
                              className="w-100 shadow-1-strong rounded"
                              role="button"
                              onClick={() => showImage(true, m.mediaUrl)}
                            />
                            {isAdmin && (
                              <Stack
                                direction="horizontal"
                                gap={2}
                                className="mt-1"
                              >
                                {mode == "waiting" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="success"
                                      onClick={() =>
                                        doUpdateMessage({
                                          ...m,
                                          isPublished: true,
                                        })
                                      }
                                    >
                                      Valid
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() =>
                                        showConfirmDeleteMessage(true, m)
                                      }
                                    >
                                      Delete
                                    </Button>
                                  </>
                                )}
                                {mode != "waiting" && (
                                  <Button
                                    size="sm"
                                    variant="warning"
                                    onClick={() =>
                                      doUpdateMessage({
                                        ...m,
                                        isPublished: false,
                                      })
                                    }
                                  >
                                    Remove
                                  </Button>
                                )}
                              </Stack>
                            )}
                          </div>
                        ))}
                    </Col>
                  ))}
                </Row>
                {pages > 1 && (
                  <Row>
                    <Col>
                      <Pagination className="justify-content-center">
                        {pages > 4 && page > 0 && (
                          <Pagination.First onClick={() => setPage(0)} />
                        )}
                        {pages > 4 && page > 0 && (
                          <Pagination.Prev onClick={() => setPage(page - 1)} />
                        )}
                        {page >= 4 && <Pagination.Ellipsis disabled />}
                        {[...Array(pages).keys()]
                          .filter((i) => i > page - 4 && i < page + 4)
                          .map((i) => (
                            <Pagination.Item
                              key={i}
                              active={page == i}
                              onClick={() => setPage(i)}
                            >
                              {i + 1}
                            </Pagination.Item>
                          ))}
                        {pages - page > 4 && <Pagination.Ellipsis disabled />}
                        {pages > 4 && page + 1 != pages && (
                          <Pagination.Next onClick={() => setPage(page + 1)} />
                        )}
                        {pages > 4 && page + 1 != pages && (
                          <Pagination.Last onClick={() => setPage(pages - 1)} />
                        )}
                      </Pagination>
                    </Col>
                  </Row>
                )}
              </Container>
            </Card.Body>
          </CJoliCard>
        </div>
      </CJoliStack>
      <ConfirmationModal<Message>
        id="confirmDeleteMessage"
        title="Delete Message"
        onConfirm={async (message) => {
          doDeleteMessage(message);
          return true;
        }}
      >
        Are you sure you want to remove this message?
      </ConfirmationModal>
    </Loading>
  );
};

export default GalleryPage;
