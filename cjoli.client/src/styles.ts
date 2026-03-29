import { css, Theme } from "@emotion/react";
import { useColor } from "./hooks/useColor";
import { useCJoli } from "./hooks/useCJoli";

export const zoomIcon = () => css`
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.2);
  }
`;

export const bgSecondary = ({ theme }: { theme: Theme }) =>
  css({
    backgroundColor: `${theme.colors.secondary} !important`,
    color: "white !important",
    textAlign: "center",
  });

export const useGlobal = (theme: Theme) => {
  const { lightness, isWhite } = useColor();
  const {
    theme: { primary, secondary },
  } = useCJoli();

  return css`
    body {
      background-color: ${theme.colors.primary};
      color: white;
      uuser-select: none;
    }
    input::placeholder {
      opacity: 0.5 !important;
    }
    span.badge.bg-secondary.menu {
      background-color: grey !important;
      opacity: 0.5;
    }
    .btn-primary {
      --bs-btn-bg: ${lightness(primary, 10)};
      --bs-btn-border-color: ${isWhite(primary)
        ? "black"
        : lightness(primary, 10)};
      --bs-btn-hover-bg: ${lightness(primary, isWhite(primary) ? -5 : 20)};
      --bs-btn-hover-border-color: ${isWhite(primary)
        ? "black"
        : lightness(primary, 20)};
      --bs-btn-active-bg: ${lightness(primary, isWhite(primary) ? -10 : 30)};
      --bs-btn-active-border-color: ${isWhite(primary)
        ? "black"
        : lightness(primary, 30)};
      --bs-btn-disabled-bg: ${lightness(primary, 10)};
      --bs-btn-color: ${isWhite(primary) ? "black" : "white"};
      --bs-btn-hover-color: ${isWhite(primary) ? "black" : "white"};
      --bs-btn-active-color: ${isWhite(primary) ? "black" : "white"};
      --bs-btn-disabled-color: ${isWhite(primary) ? "black" : "white"};
    }
    .btn-outline-primary {
      --bs-btn-color: ${isWhite(primary) ? secondary : primary};
      --bs-btn-border-color: ${isWhite(primary) ? secondary : primary};
      --bs-btn-hover-color: #fff;
      --bs-btn-hover-bg: ${isWhite(primary) ? secondary : primary};
      --bs-btn-hover-border-color: ${isWhite(primary) ? secondary : primary};
      --bs-btn-focus-shadow-rgb: 13, 110, 253;
      --bs-btn-active-color: #fff;
      --bs-btn-active-bg: ${isWhite(primary) ? secondary : primary};
      --bs-btn-active-border-color: ${isWhite(primary) ? secondary : primary};
      --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      --bs-btn-disabled-color: ${isWhite(primary) ? secondary : primary};
      --bs-btn-disabled-bg: transparent;
      --bs-btn-disabled-border-color: ${isWhite(primary) ? secondary : primary};
      --bs-gradient: none;
    }
    .progress {
      --bs-progress-bar-bg: ${theme.colors.secondary};
    }
    .accordion-button {
      --bs-accordion-active-bg: ${theme.colors.secondary};
      &:not(collapsed),
      &:not(collapsed)::after {
        --bs-accordion-active-color: white;
        --bs-body-color: white;
      }
    }
    .bg-primary {
      background-color: ${theme.colors.primary} !important;
    }
    .bg-secondary {
      --bs-bg-opacity: 1;
      --bs-secondary-rgb: 120, 129, 169;
    }
    .form-check-input:checked {
      background-color: ${lightness(primary, isWhite(primary) ? -50 : 10)};
      border-color: ${lightness(primary, isWhite(primary) ? -50 : 10)};
    }

    .nav-pills {
      --bs-nav-pills-link-active-bg: ${theme.colors.secondary};
      --bs-link-color: ${theme.colors.secondary};
      --bs-link-hover-color: ${theme.colors.secondary};
    }

    :root {
      dis--bs-border-color: red;
    }

    .nav-tabs {
      --bs-nav-tabs-border-color: ${theme.colors.primary};
      --bs-nav-tabs-link-hover-border-color: var(--bs-secondary-bg)
        var(--bs-secondary-bg) ${theme.colors.primary};
      --bs-nav-tabs-link-active-border-color: ${theme.colors.primary}
        ${theme.colors.primary} var(--bs-body-bg);
    }

    .popover {
      --bs-popover-max-width: 800px;
    }

    .chat-messages {
      display: flex;
      flex-direction: column;
      max-height: 800px;
      overflow-y: scroll;
    }

    .chat-message-left,
    .chat-message-right {
      display: flex;
      flex-shrink: 0;
    }

    .chat-message-left {
      margin-right: auto;
    }

    .chat-message-right {
      flex-direction: row-reverse;
      margin-left: auto;
    }

    .main-timeline-2 {
      position: relative;
    }

    .main-timeline-2::after {
      content: "";
      position: absolute;
      width: 3px;
      background-color: #26c6da;
      top: 0;
      bottom: 0;
      left: 50%;
      margin-left: -3px;
    }

    .timeline-2 {
      position: relative;
      background-color: inherit;
      width: 50%;
    }

    .timeline-2::after {
      content: "";
      position: absolute;
      width: 25px;
      height: 25px;
      right: -11px;
      background-color: #26c6da;
      top: 15px;
      border-radius: 50%;
      z-index: 1;
    }

    .left-2 {
      padding: 0px 40px 20px 0px;
      left: 0;
    }

    .right-2 {
      padding: 0px 0px 20px 40px;
      left: 50%;
    }

    .left-2::before {
      content: " ";
      position: absolute;
      top: 18px;
      z-index: 1;
      right: 30px;
      border: medium solid white;
      border-width: 10px 0 10px 10px;
      border-color: transparent transparent transparent white;
    }

    .right-2::before {
      content: " ";
      position: absolute;
      top: 18px;
      z-index: 1;
      left: 30px;
      border: medium solid white;
      border-width: 10px 10px 10px 0;
      border-color: transparent white transparent transparent;
    }

    .right-2::after {
      left: -14px;
    }

    @media screen and (max-width: 600px) {
      /* Place the timelime to the left */
      .main-timeline-2::after {
        left: 31px;
      }

      .timeline-2 {
        width: 100%;
        padding-left: 70px;
        padding-right: 25px;
      }

      .timeline-2::before {
        left: 60px;
        border: medium solid white;
        border-width: 10px 10px 10px 0;
        border-color: transparent white transparent transparent;
      }

      .left-2::after,
      .right-2::after {
        left: 18px;
      }

      .left-2::before {
        right: auto;
      }

      .right-2 {
        left: 0%;
      }
    }
  `;
};
