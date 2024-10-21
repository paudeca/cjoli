import styled from "@emotion/styled";

const Loader = styled("div")`
  /* HTML: <div class="loader"></div> */
  height: 9px;
  width: 60px;
  --c: no-repeat linear-gradient(#000 0 0);
  background: var(--c), var(--c), var(--c), var(--c);
  background-size: 26% 3px;
  animation: l5 1s infinite;
  @keyframes l5 {
    0%,
    70%,
    100% {
      background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 50%,
        calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%;
    }
    12.5% {
      background-position: calc(0 * 100% / 3) 0, calc(1 * 100% / 3) 50%,
        calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%;
    }
    25% {
      background-position: calc(0 * 100% / 3) 0, calc(1 * 100% / 3) 100%,
        calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%;
    }
    37.5% {
      background-position: calc(0 * 100% / 3) 0, calc(1 * 100% / 3) 100%,
        calc(2 * 100% / 3) 0, calc(3 * 100% / 3) 50%;
    }
    50%,
    60% {
      background-position: calc(0 * 100% / 3) 0, calc(1 * 100% / 3) 100%,
        calc(2 * 100% / 3) 0, calc(3 * 100% / 3) 100%;
    }
  }
`;

export default Loader;
