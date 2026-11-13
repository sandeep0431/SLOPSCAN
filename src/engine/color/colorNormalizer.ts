export interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
  hex: string;
  hsl: { h: number; s: number; l: number };
  luminance: number;
  isNeutral: boolean;
  isSaturated: boolean;
  hueGroup: string;
}

const NAMED_COLORS: Record<string, string> = {
  transparent: 'rgba(0, 0, 0, 0)',
  currentcolor: 'currentColor',
  inherit: 'inherit',
  white: '#ffffff',
  black: '#000000',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  orange: '#ffa500',
  purple: '#800080',
  cyan: '#00ffff',
  gray: '#808080',
  grey: '#808080',
  lightgray: '#d3d3d3',
  darkgray: '#a9a9a9',
  whitesmoke: '#f5f5f5',
  snow: '#fffafa',
};

// Calculate relative luminance according to WCAG 2.1
export function calculateLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate WCAG contrast ratio between two relative luminances
export function calculateContrast(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case rNorm:
      h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
      break;
    case gNorm:
      h = (bNorm - rNorm) / d + 2;
      break;
    case bNorm:
      h = (rNorm - gNorm) / d + 4;
      break;
  }
  h = Math.round(h * 60);

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Classify hue into a human-meaningful band
export function getHueGroup(h: number, s: number, l: number): string {
  // Low saturation or extreme lightness/darkness is neutral
  if (s < 14 || l <= 12 || l >= 92) return 'neutral';

  if (h >= 345 || h < 15) return 'red';
  if (h >= 15 && h < 40) return 'orange';
  if (h >= 40 && h < 65) return 'amber';
  if (h >= 65 && h < 150) return 'green';
  if (h >= 150 && h < 190) return 'teal';
  if (h >= 190 && h < 225) return 'cyan';
  if (h >= 225 && h < 255) return 'blue';
  if (h >= 255 && h < 290) return 'indigo';
  if (h >= 290 && h < 325) return 'purple';
  return 'pink';
}

function componentToHex(c: number): string {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`.toUpperCase();
}

// Main parser and normalizer
export function parseAndNormalizeColor(rawColor: string): ParsedColor | null {
  if (!rawColor) return null;
  let str = rawColor.trim().toLowerCase();

  if (str === 'transparent' || str === 'rgba(0, 0, 0, 0)' || str === 'currentcolor' || str === 'inherit') {
    return null;
  }

  if (NAMED_COLORS[str]) {
    str = NAMED_COLORS[str];
  }

  // 1. Match rgb / rgba: rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = str.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\)/i);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    const a = rgbMatch[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(rgbMatch[4]))) : 1;

    // Discard zero opacity
    if (a === 0) return null;

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const luminance = calculateLuminance(r, g, b);
    const isNeutral = hsl.s < 14 || hsl.l <= 12 || hsl.l >= 92;
    const isSaturated = hsl.s >= 35 && hsl.l > 15 && hsl.l < 85;
    const hueGroup = getHueGroup(hsl.h, hsl.s, hsl.l);

    return { r, g, b, a, hex, hsl, luminance, isNeutral, isSaturated, hueGroup };
  }

  // 2. Match Hex: #FFF, #FFFFFF, #FFFFFF80
  const hexMatch = str.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hexVal = hexMatch[1];
    let a = 1;
    if (hexVal.length === 3) {
      hexVal = hexVal.split('').map((c) => c + c).join('');
    } else if (hexVal.length === 4) {
      const alphaHex = hexVal[3] + hexVal[3];
      a = parseInt(alphaHex, 16) / 255;
      hexVal = hexVal.slice(0, 3).split('').map((c) => c + c).join('');
    } else if (hexVal.length === 8) {
      a = parseInt(hexVal.slice(6, 8), 16) / 255;
      hexVal = hexVal.slice(0, 6);
    }

    if (a === 0) return null;

    const r = parseInt(hexVal.substring(0, 2), 16);
    const g = parseInt(hexVal.substring(2, 4), 16);
    const b = parseInt(hexVal.substring(4, 6), 16);

    const fullHex = `#${hexVal.toUpperCase()}`;
    const hsl = rgbToHsl(r, g, b);
    const luminance = calculateLuminance(r, g, b);
    const isNeutral = hsl.s < 14 || hsl.l <= 12 || hsl.l >= 92;
    const isSaturated = hsl.s >= 35 && hsl.l > 15 && hsl.l < 85;
    const hueGroup = getHueGroup(hsl.h, hsl.s, hsl.l);

    return { r, g, b, a, hex: fullHex, hsl, luminance, isNeutral, isSaturated, hueGroup };
  }

  return null;
}

// Cluster colors into near-identical visual groups without erasing intentional shades
export function areColorsVisuallyEquivalent(
  color1: ParsedColor | string,
  color2: ParsedColor | string
): boolean {
  const c1 = typeof color1 === 'string' ? parseAndNormalizeColor(color1) : color1;
  const c2 = typeof color2 === 'string' ? parseAndNormalizeColor(color2) : color2;
  if (!c1 || !c2) return false;

  if (c1.hex === c2.hex) return true;

  // If both are neutral (e.g. #0F172A vs #111827), check lightness difference
  if (c1.isNeutral && c2.isNeutral) {
    return Math.abs(c1.hsl.l - c2.hsl.l) <= 3;
  }

  // If both are saturated, check hue and lightness difference
  if (!c1.isNeutral && !c2.isNeutral) {
    const hueDiff = Math.abs(c1.hsl.h - c2.hsl.h);
    const cyclicHueDiff = Math.min(hueDiff, 360 - hueDiff);
    const satDiff = Math.abs(c1.hsl.s - c2.hsl.s);
    const lightDiff = Math.abs(c1.hsl.l - c2.hsl.l);

    // Nearly identical colors (e.g. #6366F1 vs #6466F2)
    return cyclicHueDiff <= 4 && satDiff <= 5 && lightDiff <= 4;
  }

  return false;
}
