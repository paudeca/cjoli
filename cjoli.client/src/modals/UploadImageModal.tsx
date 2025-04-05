import { Badge, Button, Col, Row } from "react-bootstrap";
import ContentModal from "./ContentModal";
import UploadImageInput from "../components/UploadImageInput";
import { QrCode, Whatsapp } from "react-bootstrap-icons";
import { Trans } from "react-i18next";
import { useCJoli } from "../hooks/useCJoli";
import { useModal } from "../hooks/useModal";

const UploadImageModal = () => {
  const { tourney } = useCJoli();
  const whatsapp = tourney?.whatsappNumber
    ? tourney?.whatsappNumber.replace("+", "")
    : undefined;
  const { setShowWithData: showImage } = useModal<string>("image");

  return (
    <ContentModal id="uploadImage" title="Upload">
      <Row>
        <Col>
          <UploadImageInput />
        </Col>
      </Row>
      {whatsapp && (
        <>
          <Row>
            <Col>
              <hr />
            </Col>
          </Row>
          <Row className="justify-content-center align-items-center">
            <Col xs lg="2">
              <Button
                variant="success"
                onClick={() => window.open(`https://wa.me/${whatsapp}`)}
                className="d-flex align-items-center"
              >
                <Whatsapp className="mx-2" />
                <Trans i18nKey="gallery.whatsapp">WhatsApp</Trans>
              </Button>
            </Col>
            <Col md="auto" className="justify-content-center">
              <Badge className="mx-2" bg="transparent" text="dark">
                OR
              </Badge>
            </Col>
            <Col xs lg="2">
              <Button
                variant="success"
                onClick={() => showImage(true, `/qrcodes/${whatsapp}.png`)}
                className="d-flex align-items-center"
              >
                <QrCode className="mx-2" />
                <Trans i18nKey="gallery.qrCode">QRCode</Trans>
              </Button>
            </Col>
          </Row>
        </>
      )}
    </ContentModal>
  );
};

export default UploadImageModal;
