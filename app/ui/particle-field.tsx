"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; dx: number; dy: number; radius: number; alpha: number };

type NavigatorWithHints = Navigator & { deviceMemory?: number };

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const navigatorHints = navigator as NavigatorWithHints;
    const lowEnd = (navigatorHints.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const count = lowEnd ? 24 : coarsePointer ? 38 : 72;
    const frameBudget = lowEnd ? 34 : 0;
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastFrame = 0;
    let animation = 0;
    let visible = !document.hidden;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.5);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles.length = 0;
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          dx: (Math.random() - 0.5) * (lowEnd ? 0.08 : 0.14),
          dy: (Math.random() - 0.5) * (lowEnd ? 0.08 : 0.14),
          radius: 0.6 + Math.random() * 1.4,
          alpha: 0.16 + Math.random() * 0.44,
        });
      }
    };

    const render = (time: number) => {
      animation = requestAnimationFrame(render);
      if (!visible || (frameBudget && time - lastFrame < frameBudget)) return;
      lastFrame = time;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#e7d7ff";
      for (const particle of particles) {
        particle.x += particle.dx;
        particle.y += particle.dy;
        if (particle.x < -4) particle.x = width + 4;
        if (particle.x > width + 4) particle.x = -4;
        if (particle.y < -4) particle.y = height + 4;
        if (particle.y > height + 4) particle.y = -4;
        context.globalAlpha = particle.alpha;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const onVisibility = () => { visible = !document.hidden; };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    animation = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}
