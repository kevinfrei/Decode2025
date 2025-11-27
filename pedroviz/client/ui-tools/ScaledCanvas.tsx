import React, { useRef, useEffect, ReactElement } from 'react';
import { getBezierPoints, Point } from '../state/API';
import { bezierLength, bezierDerivative, deCasteljau } from './bezier';
import { useAtomValue } from 'jotai';
import { CurPathChainAtom } from '../state/Atoms';
import { NamedPathChain } from '../../server/types';

const Scale = 1;
const xwid = 1;

const styles = ['#000', '#00f', '#0f0', '#0ff', '#f00', '#f0f', '#ff0', '#fff'];

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

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Map logical 144×144 units into square
    const scale = squareSize / (144 * Scale);
    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, 144 * Scale, 144 * Scale);

    ctx.fillStyle = 'red';
    points.forEach((curve) => {
      const len = bezierLength(curve);
      const pts: Point[] = [];
      for (let t = 0; t <= 1.0; t += 1 / len) {
        pts.push(deCasteljau(curve, t));
      }
      ctx.font = '3px Arial'; // Set font size and family
      ctx.fillStyle = 'blue'; // Set fill color for the text
      ctx.textAlign = 'center'; // Set text alignment (e.g., "start", "end", "center")
      ctx.textBaseline = 'middle'; // Set vertical alignment (e.g., "top", "middle", "bottom")
      ctx.fillText('Test Text', 45, 80);

      ctx.beginPath();
      ctx.lineWidth = 0.25;
      ctx.strokeStyle = 'black';
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
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = 'blue';
      for (const pt of curve) {
        ctx.moveTo(pt.x, pt.y);
        ctx.arc(pt.x, pt.y, xwid, 0, 2 * Math.PI);
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
