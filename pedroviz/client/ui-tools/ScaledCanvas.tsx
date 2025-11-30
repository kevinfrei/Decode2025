import { useAtomValue } from 'jotai';
import { ReactElement, useEffect, useRef } from 'react';
import { NamedPathChain } from '../../server/types';
import { getBezierPoints, Point } from '../state/API';
import { CurPathChainAtom } from '../state/Atoms';
import { bezierDerivative, bezierLength, deCasteljau } from './bezier';
import { GenerateColors } from './Colors';

const Scale = 1;
const PointRadius = 1;

const styles = [
  '#700',
  '#540',
  '#380',
  '#063',
  '#069',
  '#107',
  '#a0a',
  '#802',
  '#530',
  '#590',
  '#062',
  '#099',
  '#017',
  '#405',
  '#803',
  '#620',
  '#790',
  '#071',
  '#0a9',
  '#127',
  '#305',
  '#815',
  '#610',
  '#891',
  '#160',
];
const dark = [
  '#f77',
  '#fd4',
  '#af7',
  '#5fa',
  '#8df',
  '#76f',
  '#f9f',
  '#f79',
  '#fb5',
  '#cf8',
  '#5f8',
  '#9ef',
  '#67f',
  '#c4f',
  '#f7a',
  '#f95',
  '#df8',
  '#6f6',
  '#9fe',
  '#79e',
  '#a5e',
  '#e8c',
  '#e76',
  '#ef9',
  '#7e6',
];

const fix = 144;

export function ScaledCanvas(): ReactElement {
  const someCOlors = GenerateColors(27);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curPathChainFile = useAtomValue(CurPathChainAtom);
  const pathChains = curPathChainFile.pathChains;
  const points = pathChains
    .map((npc: NamedPathChain) => {
      const bps = npc.paths.map(getBezierPoints);
      // TODO: Map each path to a style
      return bps;
    })
    .flat(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    const squareSize = Math.min(rect.width, rect.height);

    canvas.width = squareSize * dpr;
    canvas.height = squareSize * dpr;
    canvas.style.width = `${squareSize}px`;
    canvas.style.height = `${squareSize}px`;

    // Map logical 144×144 units into square
    const scale = squareSize / (fix * Scale);
    // Move the origin to the lower left, corner, and scale it up
    // ctx.translate(0, canvas.height);
    // ctx.scale(dpr * scale, -dpr * scale);
    // or just a single line of code:
    ctx.setTransform(dpr * scale, 0, 0, -dpr * scale, 0, canvas.height);

    ctx.clearRect(0, 0, fix * Scale, fix * Scale);

    ctx.fillStyle = 'red';
    let i = 0;

    let count = 0;
    points.forEach((curve) => {
      const len = bezierLength(curve);
      const pts: Point[] = [];
      for (let t = 0; t <= 1.0; t += 1 / len) {
        pts.push(deCasteljau(curve, t));
      }
      ctx.save();
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.font = '3px Arial'; // Set font size and family
      ctx.fillStyle = 'blue'; // Set fill color for the text
      ctx.textAlign = 'center'; // Set text alignment (e.g., "start", "end", "center")
      ctx.textBaseline = 'middle'; // Set vertical alignment (e.g., "top", "middle", "bottom")
      ctx.fillText(`Text${i}`, 45 + 15 * i++, fix - (80 + 5 * i));
      ctx.restore();

      ctx.beginPath();
      ctx.lineWidth = 0.25;
      ctx.strokeStyle = styles[(count++ % styles.length) % count++];
      ctx.moveTo(curve[0].x * Scale, curve[0].y * Scale);
      for (const pt of pts) {
        ctx.lineTo(pt.x * Scale, pt.y * Scale);
      }
      ctx.lineTo(
        curve[curve.length - 1].x * Scale,
        curve[curve.length - 1].y * Scale,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.lineWidth = 0.5;
      for (const pt of curve) {
        ctx.moveTo(pt.x + PointRadius, pt.y);
        ctx.arc(pt.x, pt.y, PointRadius, 0, 2 * Math.PI);
      }
      ctx.stroke();
      const tang = bezierDerivative(curve, 0.4);
      const mid = deCasteljau(curve, 0.4);
      /*
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red';
      ctx.moveTo(
        mid.x * Scale - (tang.x * Scale) / 4,
        mid.y * Scale - (tang.y * Scale) / 4,
      );
      ctx.lineTo(
        mid.x * Scale + (tang.x * Scale) / 4,
        mid.y * Scale + (tang.y * Scale) / 4,
      );
      ctx.stroke();
      */
    });
  }, [curPathChainFile, canvasRef]);

  return <canvas className="field" ref={canvasRef} />;
}
