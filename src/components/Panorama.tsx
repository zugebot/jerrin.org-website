// src/components/Panorama.tsx
import { useEffect, useMemo, useRef, useState } from "react";

function isNightNow() {
    const h = new Date().getHours(); // user local time (LA for you, but generally correct for viewer)
    return h >= 18 || h < 6;
}

export default function Panorama({ blurPx = 6 }: { blurPx?: number }) {
    const layerRef = useRef<HTMLDivElement | null>(null);
    const [isNight, setIsNight] = useState(() => isNightNow());

    // Update theme at boundaries (polling every minute is cheap + reliable)
    useEffect(() => {
        const id = window.setInterval(() => setIsNight(isNightNow()), 60_000);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        const el = layerRef.current;
        if (!el) return;

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        if (reduce) return;

        const PX_PER_SEC = 20;

        let raf = 0;
        const start = performance.now();

        const tick = (t: number) => {
            const seconds = (t - start) / 1000;
            const x = -(seconds * PX_PER_SEC);
            el.style.backgroundPosition = `${x}px 0px`;
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    const bgUrl = useMemo(
        () => (isNight ? 'url("/panorama_dark.jpg")' : 'url("/panorama_light.png")'),
        [isNight]
    );

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: -10, overflow: "hidden" }}>
            <div
                ref={layerRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "calc(100% + 0.6vw)",
                    height: "calc(100% + 1vh)",
                    marginLeft: "-0.3vw",
                    marginTop: "-0.6vh",

                    filter: `blur(${blurPx}px) saturate(1.05)`,
                    transform: "translateZ(0)",

                    backgroundImage: bgUrl,
                    backgroundRepeat: "repeat-x",
                    backgroundSize: "auto 100%",
                    backgroundPosition: "0px 0px",

                    willChange: "background-position, filter",
                }}
            />
        </div>
    );
}
