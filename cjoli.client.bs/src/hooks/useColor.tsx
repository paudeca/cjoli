export const useColor = () => {
  const checkRange = (count: number, start: number, end: number) => {
    if (count < start) return start;
    if (count > end) return end;
    return count;
  };

  const getFullHEX = (hex: string) => {
    const [r, g, b] = hex.slice(1, 4).split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  };

  const checkColor = (color: string) => {
    if (typeof color !== "string") return { hex: color, check: false };
    color = color.toLowerCase();
    const isHEX = color.slice(0, 1) === "#";

    if (isHEX) {
      const validHEX = color.search(/^#[a-f0-9]{3}([a-f0-9]{3})?$/) !== -1;
      return {
        hex: validHEX && color.length === 4 ? getFullHEX(color) : color,
        check: validHEX,
      };
    }
    return { hex: color, check: false };
  };

  const checkRGB = (r: number, g: number, b: number) => {
    r = checkRange(r, 0, 255);
    g = checkRange(g, 0, 255);
    b = checkRange(b, 0, 255);
    return { r, g, b };
  };

  const HEXToRGB = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const calculH = (
    delta: number,
    max: number,
    { r, g, b }: { r: number; g: number; b: number }
  ) => {
    let h = 0;
    if (delta === 0) {
      h = 0;
    } else if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else if (max === b) {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);
    h = h < 0 ? h + 360 : h;
    return h;
  };

  const RGBToHSL = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    let [h, s, l] = [0, 0, 0];

    h = calculH(delta, max, { r, g, b });

    l = (max + min) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    l = +(l * 100).toFixed(1);
    s = +(s * 100).toFixed(1);

    l = checkRange(l, 0, 100);
    s = checkRange(s, 0, 100);

    return { h, s, l };
  };

  // eslint-disable-next-line max-statements
  const calculRgb = ({ h, c, x }: { h: number; c: number; x: number }) => {
    let [r, g, b] = [0, 0, 0];

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }
    return { r, g, b };
  };

  const HSLToRGB = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let { r, g, b } = calculRgb({ c, h, x });

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return checkRGB(r, g, b);
  };

  const getHEX = (code: number) => {
    const hex = code.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  const RGBToHEX = (r: number, g: number, b: number) =>
    `#${getHEX(r)}${getHEX(g)}${getHEX(b)}`;

  const lightness = (color: string, percent = 0) => {
    const { hex, check } = checkColor(color);
    if (!check || typeof percent !== "number" || percent === 0) return color;
    percent = checkRange(percent, -100, 100);

    const { r, g, b } = HEXToRGB(hex);
    const hsl = RGBToHSL(r, g, b);
    const { h, s } = hsl;
    let { l } = hsl;
    const range = percent > 0 ? 100 - l : l;
    l += Math.round(range * 0.01 * percent);

    const { r: R, g: G, b: B } = HSLToRGB(h, s, l);

    return RGBToHEX(R, G, B);
  };

  const isWhite = (color: string) => {
    const { hex, check } = checkColor(color);
    if (!check) return false;
    const { r, g, b } = HEXToRGB(hex);
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return y > 128 + 64;
  };

  return { lightness, isWhite };
};
