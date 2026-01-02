import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type GuiCtx = {
    scale: number;
    setScale: (n: number) => void;
    bump: (dir: 1 | -1) => void;
};

const SCALE_STEP = 0.25;
const INV_S = 4; // 0.25 increments
const DEFAULT = 2.5;
const LOWER = 1.0;
const UPPER = 6.0;

const GuiContext = createContext<GuiCtx | null>(null);

function clamp(n: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, n));
}

function quantize(n: number) {
    return Math.round(n * INV_S) / INV_S;
}

export function useGui() {
    const ctx = useContext(GuiContext);
    if (!ctx) throw new Error("useGui must be used inside <GuiRoot/>");
    return ctx;
}

export default function GuiRoot(props: { children: React.ReactNode }) {
    const [scale, setScaleRaw] = useState(() => {
        const saved = localStorage.getItem("guiScale");
        const n = saved ? Number(saved) : DEFAULT;
        return Number.isFinite(n) ? clamp(quantize(n), LOWER, UPPER) : DEFAULT;
    });

    const setScale = (n: number) => {
        const q = clamp(quantize(n), LOWER, UPPER);
        setScaleRaw(q);
        localStorage.setItem("guiScale", String(q));
    };

    const bump = (dir: 1 | -1) => setScale(scale + dir * SCALE_STEP);

    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;

            // Stop browser zoom
            e.preventDefault();

            const dir: 1 | -1 = e.deltaY < 0 ? 1 : -1;
            bump(dir);
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        return () => window.removeEventListener("wheel", onWheel as any);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale]);

    const value = useMemo<GuiCtx>(() => ({ scale, setScale, bump }), [scale]);

    return (
        <GuiContext.Provider value={value}>
            <div className="fixed inset-0 overflow-hidden">
                {/* ✅ not scaled: your whole app renders normally */}
                {props.children}

                {/* tiny HUD so you can see GUI scale */}
                <div className="fixed left-0 top-0 z-[9999] rounded-br bg-black/60 px-[4px] py-[1px] text-[16px] text-white">
                    GUI: {scale} (Ctrl + Wheel)
                </div>

                {/* ✅ global CSS variable used by ONLY .guiScaled */}
                <style>{`
          :root { --guiScale: ${scale}; }

          /* Only elements you wrap in .guiScaled get scaled */
          .guiScaled {
            position: absolute;
            left: 0;
            top: 0;

            transform: scale(var(--guiScale));
            transform-origin: top left;

            /* compensate layout like your old approach */
            width: calc(100vw / var(--guiScale));
            height: calc(100vh / var(--guiScale));
          }
        `}</style>
            </div>
        </GuiContext.Provider>
    );
}
