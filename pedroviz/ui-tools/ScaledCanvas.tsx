import React, { useRef, useEffect } from 'react';
import { Point } from '../state/API';

interface CanvasProps {
  points: Point[];
}

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
    const scale = squareSize / 144;
    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, 144, 144);

    ctx.fillStyle = 'red';
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points]);

  return <canvas ref={canvasRef} />;
};
