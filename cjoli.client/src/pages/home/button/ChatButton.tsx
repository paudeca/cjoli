import { Button } from "react-bootstrap";
import { ChatLeftDots } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import useScreenSize from "../../../hooks/useScreenSize";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../hooks/useServer";

const ChatButton = () => {
  const navigate = useNavigate();
  const { path } = useServer();
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();

  return (
    <Button
      onClick={() => navigate(`${path}chat`)}
      variant={isMobile ? "primary" : "light"}
    >
      {!isMobile && t("button.botAI", "Chat with BotAI")}
      <ChatLeftDots className="mx-1" />
    </Button>
  );
};

export default ChatButton;
