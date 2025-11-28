import React, { useRef, useEffect, ReactElement } from 'react';
import { getBezierPoints, Point } from '../state/API';
import { bezierLength, bezierDerivative, deCasteljau } from './bezier';
import { useAtomValue } from 'jotai';
import { CurPathChainAtom } from '../state/Atoms';
import { NamedPathChain } from '../../server/types';

const Scale = 1;
const PointRadius = 1;

const styles = [
  '#501',
  '#209',
  '#812',
  '#106',
  '#700',
  '#005',
  '#520',
  '#016',
  '#950',
  '#056',
  '#630',
  '#055',
  '#860',
  '#064',
  '#a80',
  '#063',
  '#ba0',
  '#0a4',
  '#880',
  '#070',
  '#570',
  '#081',
  '#360',
  '#480',
  '#5a0',
];
const dar = [
  '#f78',
  '#f9b',
  '#f77',
  '#94e',
  '#e65',
  '#96f',
  '#f97',
  '#b9f',
  '#f97',
  '#64f',
  '#fa7',
  '#44f',
  '#fc7',
  '#54f',
  '#fe7',
  '#55f',
  '#ff8',
  '#76f',
  '#9e7',
  '#45f',
  '#8f8',
  '#66e',
  '#5e7',
  '#78f',
  '#7df',
];

const fix = 144;

export function ScaledCanvas(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curPathChainFile = useAtomValue(CurPathChainAtom);
  const pathChains = curPathChainFile.pathChains;
  const points = pathChains
    .map((npc: NamedPathChain) => {
      return npc.paths.map(getBezierPoints);
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
