"use client";

import { useEffect, useRef } from "react";

/* ─── Particle system ──────────────────────────────────────────── */
interface Particle {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let particles: Particle[] = [];

        function resize() {
            canvas!.width = window.innerWidth;
            canvas!.height = window.innerHeight;
        }

        function spawn() {
            particles = Array.from({ length: 60 }, () => ({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 0.4 + 0.08,
                opacity: Math.random() * 0.4 + 0.08,
            }));
        }

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of particles) {
                p.y -= p.speed;
                if (p.y < 0) {
                    p.y = canvas.height;
                    p.x = Math.random() * canvas.width;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(56,189,248,${p.opacity})`; // cyan
                ctx.fill();
            }
            animationId = requestAnimationFrame(animate);
        }

        resize();
        spawn();
        animate();

        window.addEventListener("resize", resize);
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, [canvasRef]);
}

/* ─── Component ────────────────────────────────────────────────── */
export function FuturisticBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useParticles(canvasRef);

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {/* Layer 1 – Dark base */}
            <div className="absolute inset-0 bg-[#05050f]" />

            {/* Layer 2 – Animated gradient orbs */}
            <div className="absolute inset-0">
                <div className="animate-drift-1 absolute -top-[200px] -left-[100px] h-[600px] w-[600px] rounded-full bg-indigo-500 opacity-25 blur-[80px]" />
                <div className="animate-drift-2 absolute top-[40%] -right-[150px] h-[500px] w-[500px] rounded-full bg-sky-500 opacity-25 blur-[80px]" />
                <div className="animate-drift-3 absolute -bottom-[100px] left-[30%] h-[400px] w-[400px] rounded-full bg-violet-500 opacity-25 blur-[80px]" />
            </div>

            {/* Layer 3 – Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Layer 4 – Radial vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(5,5,15,0.7) 100%)",
                }}
            />

            {/* Layer 5 – Noise / grain texture */}
            <div
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "200px 200px",
                }}
            />

            {/* Layer 6 – Scanlines */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
                }}
            />

            {/* Layer 7 – Floating particles (Canvas) */}
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
}