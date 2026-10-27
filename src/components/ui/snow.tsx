"use client";

import { useEffect, useRef } from "react";

export function Snow() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const container = canvas.parentElement as HTMLDivElement;

        let width = 0;
        let height = 0;

        const snowflakes: any[] = [];
        let snowLevels: number[] = [];

        const maxSnowDepth = 80;
        const snowChars = ["❄", "❅", "❆", "❉"];

        let snowflakeCounter = 0;
        let isMelting = false;

        const creationRate = window.innerWidth > 768 ? 2 : 10;

        const resize = () => {
            width = container.clientWidth;
            height = container.clientHeight;

            canvas.width = width;
            canvas.height = height;

            snowLevels = new Array(width).fill(0);
        };

        resize();

        const handleResize = () => {
            clearTimeout((handleResize as any).t);
            (handleResize as any).t = setTimeout(resize, 200);
        };

        window.addEventListener("resize", handleResize);

        const createSnowflake = () => {
            if (snowflakes.length > 120) return; // LIMIT
            snowflakes.push({
                x: Math.random() * width,
                y: -10,
                size: Math.random() * 16 + 8,
                speed: Math.random() * 2 + 1,
                opacity: 1,
                char: snowChars[Math.floor(Math.random() * snowChars.length)],
            });
        };

        const smoothAccumulation = () => {
            for (let i = 1; i < snowLevels.length - 1; i++) {
                snowLevels[i] =
                    (snowLevels[i - 1] + snowLevels[i] + snowLevels[i + 1]) / 3;
            }
        };

        const meltSnow = () => {
            let done = true;
            for (let i = 0; i < snowLevels.length; i++) {
                if (snowLevels[i] > 0) {
                    snowLevels[i] -= Math.random() * 0.3 + 0.1;
                    if (snowLevels[i] < 0) snowLevels[i] = 0;
                    done = false;
                }
            }
            return done;
        };

        let lastTime = performance.now();
        const FPS = 30;
        const interval = 1000 / FPS;

        const animate = () => {
            if (document.visibilityState === "hidden") {
                requestAnimationFrame(animate);
                return;
            }

            const now = performance.now();
            const delta = now - lastTime;

            if (delta < interval) {
                requestAnimationFrame(animate);
                return;
            }

            lastTime = now;

            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = "white";

            for (let x = 0; x < snowLevels.length; x++) {
                ctx.fillRect(x, height - snowLevels[x], 1, snowLevels[x]);
            }

            snowflakes.forEach((f, i) => {
                ctx.globalAlpha = f.opacity;
                ctx.font = `${f.size}px sans-serif`;
                ctx.fillText(f.char, f.x, f.y);
                ctx.globalAlpha = 1;

                if (!isMelting) {
                    f.y += f.speed;
                } else {
                    f.opacity *= 0.98;
                    f.speed *= 0.98;
                }

                if (f.y >= height - snowLevels[Math.floor(f.x)]) {
                    if (!isMelting) {
                        const center = Math.floor(f.x);
                        const range = Math.ceil(f.size);

                        for (let j = -range; j <= range; j++) {
                            const idx = Math.min(
                                Math.max(center + j, 0),
                                snowLevels.length - 1
                            );

                            const falloff = Math.exp(-Math.abs(j) / 5);

                            if (snowLevels[idx] < maxSnowDepth) {
                                snowLevels[idx] += (f.size / 4) * falloff;
                            }
                        }

                        snowflakes.splice(i, 1);
                    }
                }
            });

            smoothAccumulation();

            if (!isMelting) {
                if (snowLevels.every((v) => v >= maxSnowDepth)) {
                    isMelting = true;
                } else if (snowflakeCounter % creationRate === 0) {
                    createSnowflake();
                }
                snowflakeCounter++;
            } else {
                if (meltSnow()) {
                    snowflakes.length = 0;
                    snowLevels.fill(0);
                    isMelting = false;
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: 1,
            }}
        >
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}