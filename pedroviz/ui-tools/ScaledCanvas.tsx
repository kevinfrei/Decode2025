import React, { useRef, useEffect } from 'react';
import { Point } from '../state/API';
import {bezierLength, bezierDerivative, deCasteljau} from './bezier';

interface CanvasProps {
  points: Point[][];
}

const Scale = 5;

export const ScaledCanvas: React.FC<CanvasProps> = ({ points }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Square size = min(width, height)
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
      const len = bezierLength(curve)
      const points: Point[] = [];
      for (let t = 0; t <= 1; t += .1 / len) {
        points.push(deCasteljau(curve, t));
      }
      ctx.beginPath();
      let first = true;
      for (const pt of points) {
        if (first) {
          ctx.moveTo(pt.x * Scale, pt.y * Scale);
          first = false;
        } else {
          ctx.lineTo(pt.x * Scale, pt.y * Scale);
        }
      }
      ctx.stroke();
      const tang = bezierDerivative(curve, .4);
      const mid = deCasteljau(curve, .4);
      ctx.moveTo(mid.x * Scale - tang.x * Scale / 4, mid.y * Scale - tang.y * Scale / 4);
      ctx.lineTo(mid.x * Scale + tang.x * Scale / 4, mid.y * Scale + tang.y * Scale / 4);
      ctx.stroke();
    });
  }, [points]);

  return <canvas className="field" ref={canvasRef} />;
};
