type RGB = [number, number, number];

// Utility: compute relative luminance
function luminance(rgb: RGB): number {
  const srgb = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

// Utility: contrast ratio
function contrastRatio(rgb1: RGB, rgb2: RGB): number {
  const L1 = luminance(rgb1);
  const L2 = luminance(rgb2);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

// Convert HSL → RGB
function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

function hex(flt: number): string {
  const txt = flt.toString(16);
  return (txt.length === 2 ? txt : `0${txt}`)[0];
}

type LAB = [number, number, number];

function rgbToLab([r, g, b]: RGB): LAB {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  const [R, G, B] = srgb;
  let X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  let Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  let Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

  X /= 0.95047;
  Y /= 1.0;
  Z /= 1.08883;

  const f = (t: number) =>
    t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;

  const fx = f(X),
    fy = f(Y),
    fz = f(Z);
  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);
  return [L, a, bVal];
}

// Compute hue angle in LAB a*b* plane
function labHue([_, a, b]: LAB): number {
  let angle = Math.atan2(b, a); // radians
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

// LAB-based color cycling sort
export function colorCycleSortLAB(colors: RGB[]): RGB[] {
  const withHue = colors.map((c) => {
    const lab = rgbToLab(c);
    return { rgb: c, angle: labHue(lab) };
  });

  // Sort by LAB hue angle
  withHue.sort((x, y) => x.angle - y.angle);

  // Interleave extremes to maximize separation
  const ordered: RGB[] = [];
  let left = 0,
    right = withHue.length - 1;
  while (left <= right) {
    ordered.push(withHue[left].rgb);
    if (left !== right) ordered.push(withHue[right].rgb);
    left++;
    right--;
  }

  return ordered;
}

// Generate N distinct colors visible against background
export function GenerateColors(n: number, bg: RGB = [255, 255, 255]): string[] {
  const colors: RGB[] = [];
  const basel = 70 - 45 * luminance(bg);
  const bases = 85;
  const bgContrast = 2.0;
  let ldelta = 0;
  let sdelta = 0;
  let i = 0;
  let k = 1.2;
  while (colors.length < n) {
    // oversample
    const h = ((i * 359) / n) % 360;
    const l = basel + ldelta;
    const s = bases + sdelta; // vivid saturation
    const rgb = hslToRgb(h, s, l).map(Math.round) as RGB;

    if (contrastRatio(rgb, bg) >= bgContrast) {
      let add = true;
      for (const c of colors) {
        // Try not to add visually identical colors
        if (contrastRatio(c, rgb) < k) {
          add = false;
          break;
        }
      }
      if (add) {
        colors.push(rgb);
        console.log(colors.length);
      } else {
        // Make l and s 'wander' a little bit
        ldelta = ((ldelta + 20) % 19) - 9;
        if (ldelta === 0) {
          sdelta = ((sdelta + 20) % 19) - 9;
        }
        if (sdelta === 9) {
          // Drop our contrast ratio cut-off
          k = k * (1 - 0.01 / n);
          // console.log(k);
        }
      }
    }
    i++;
  }
  console.log(i);

  return colorCycleSortLAB(colors).map(
    (rgb) => '#' + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]),
  );
}

// Example usage:
const darkOnWhite = GenerateColors(25, [255, 250, 245]);
const lightOnBlack = GenerateColors(25, [5, 10, 0]);

console.log('Against white:', darkOnWhite);
console.log('Against black:', lightOnBlack);
