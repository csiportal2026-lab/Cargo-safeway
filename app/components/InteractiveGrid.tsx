"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Approx spacing between particles in px (lower = denser) */
  spacing?: number;
  /** Max distance for two particles to be connected by a line */
  linkDistance?: number;
  /** Cursor influence radius — particles inside get pushed away */
  cursorRadius?: number;
  /** Base RGB color */
  color?: string;
};

/**
 * Molecular constellation background — particles connected by lines like
 * a chemical structure. Particles drift slowly; cursor proximity REPELS
 * nearby particles outward, bending the molecular bonds around the cursor
 * like a force field.
 */
export default function InteractiveGrid({
  spacing = 86,
  linkDistance = 135,
  cursorRadius = 210,
  color = "21, 128, 61",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    // baseX/baseY = drift "home" position; offX/offY = cursor repel offset that
    // lerps toward a target each frame; x/y = baseX + offX, baseY + offY (the
    // actually-rendered position used for both bonds and dots).
    type Particle = {
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      offX: number;
      offY: number;
      x: number;
      y: number;
      phase: number;
    };
    const particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, present: false };

    const initParticles = () => {
      particles.length = 0;
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const px = x + (Math.random() - 0.5) * spacing * 0.6;
          const py = y + (Math.random() - 0.5) * spacing * 0.6;
          particles.push({
            baseX: px,
            baseY: py,
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 0.22,
            vy: (Math.random() - 0.5) * 0.22,
            offX: 0,
            offY: 0,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = clientX - rect.left;
      mouse.ty = clientY - rect.top;
      if (!mouse.present) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      mouse.present = true;
    };
    const onMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) updateMouse(t.clientX, t.clientY);
    };
    const onMouseLeave = () => {
      mouse.present = false;
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    const linkSq = linkDistance * linkDistance;
    const cursorSq = cursorRadius * cursorRadius;
    const pushStrength = cursorRadius * 0.55;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1 / 60;

      if (mouse.present) {
        mouse.x += (mouse.tx - mouse.x) * 0.18;
        mouse.y += (mouse.ty - mouse.y) * 0.18;
      }

      for (const p of particles) {
        if (!reduced) {
          p.baseX += p.vx;
          p.baseY += p.vy;
          if (p.baseX < 0 || p.baseX > width) p.vx *= -1;
          if (p.baseY < 0 || p.baseY > height) p.vy *= -1;
        }

        // Repel target is computed from baseX/baseY (drift home), NOT from the
        // already-displaced render position — otherwise a particle pushed out
        // of the field would see a smaller force, spring back in, and oscillate.
        let targetOffX = 0;
        let targetOffY = 0;
        if (mouse.present) {
          const dx = p.baseX - mouse.x;
          const dy = p.baseY - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < cursorSq) {
            const dist = Math.sqrt(distSq);
            const safe = Math.max(dist, 0.5);
            const t = 1 - dist / cursorRadius;
            const push = t * t * pushStrength;
            targetOffX = (dx / safe) * push;
            targetOffY = (dy / safe) * push;
          }
        }

        p.offX += (targetOffX - p.offX) * 0.16;
        p.offY += (targetOffY - p.offY) * 0.16;

        p.x = p.baseX + p.offX;
        p.y = p.baseY + p.offY;
      }

      // Bonds — drawn between rendered positions, so they visibly bend around
      // the cursor as the molecules get pushed outward.
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < linkSq) {
            const t = 1 - Math.sqrt(distSq) / linkDistance;
            ctx.strokeStyle = `rgba(${color}, ${t * t * 0.14})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Particles flare brighter/bigger as they're displaced — gives visible
      // feedback of the force field without drawing connection lines.
      for (const p of particles) {
        const offMag = Math.sqrt(p.offX * p.offX + p.offY * p.offY);
        const flare = Math.min(1, offMag / pushStrength);
        const flareEased = flare * flare;

        const pulse = reduced ? 0 : Math.sin(time * 1.4 + p.phase) * 0.04;
        const opacity = Math.max(0, 0.14 + flareEased * 0.42 + pulse);
        const radius = 1.2 + flareEased * 1.8;

        ctx.fillStyle = `rgba(${color}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (mouse.present) {
        ctx.strokeStyle = `rgba(${color}, 0.12)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(${color}, 0.4)`;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseLeave);
    };
  }, [spacing, linkDistance, cursorRadius, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
}
