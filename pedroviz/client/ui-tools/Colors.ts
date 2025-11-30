type RGB = [number, number, number];
type HSL = [number, number, number];
/*
    For reference: To invert the brightness, but not the hue, of an image:
    R = 1 - (G + B) / 2
    G = 1 - (R + B) / 2
    B = 1 - (R + G) / 2

    And here's a gist that shows how to manually render an image:
    https://gist.github.com/paulirish/373253
  */

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

// Get the next prime equal to or larger than num
function nextPrime(num: number): number {
  // Unmemoized version of a sieve :D
  function isPrimeOdd(val: number): boolean {
    for (let i = 3; i * i <= val; i += 2) {
      if (isPrimeOdd(i) && val % i === 0) {
        return false;
      }
    }
    return true;
  }
  function nextPrimeOdd(val: number): number {
    return isPrimeOdd(val) ? val : nextPrimeOdd(val + 2);
  }
  const int = Math.trunc(num);
  return nextPrimeOdd(int % 2 === 0 ? int + 1 : int);
}

// Generate N distinct colors visible against background
export function GenerateColors(n: number, bg: RGB = [255, 255, 255]): string[] {
  const colors: RGB[] = [];
  const basel = 70 - 45 * luminance(bg);
  const bases = 85;
  const bgContrast = 2.0;
  let ldelta = 0;
  let sdelta = 0;
  let h = 0;
  let k = 1.2;
  // I'm going to look for N colors. To sort them in a 'nothing close is similar'
  // way, let's find the next largest prime number, divide it by 6 (assuming ppl
  // clearly differentiate 6 colors around the color wheel) and then step by that
  // number of points arond the color wheel, to make sure that we never have
  // similar colors next to each other.
  const numCount = nextPrime(Math.max(n, 6));
  const circleStep = 360 / numCount;
  const step = Math.trunc(numCount / 6);
  while (colors.length < n) {
    // oversample
    const l = basel + ldelta;
    const s = bases + sdelta; // vivid saturation
    const rgb = hslToRgb(h, s, l).map(Math.round) as RGB;
    colors.push(rgb);

    // Make l and s 'wander' a little bit
    ldelta = ((ldelta + 20) % 19) - 9;
    if (ldelta === 0) {
      sdelta = ((sdelta + 20) % 19) - 9;
    }
    h += circleStep * step;
    if (h > 360) {
      h -= 360;
    }
  }
  console.log(colors);

  return colors.map((rgb) => '#' + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]));
}

// Example usage:
const darkOnWhite = GenerateColors(25, [255, 250, 245]);
const lightOnBlack = GenerateColors(25, [5, 10, 0]);

console.log('Against white:', darkOnWhite);
console.log('Against black:', lightOnBlack);
