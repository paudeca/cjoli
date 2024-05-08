import { css, Theme } from "@emotion/react";

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
