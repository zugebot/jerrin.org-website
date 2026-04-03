import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type GuiCtx = {
    scale: number;
    setScale: (n: number) => void;
    bump: (dir: 1 | -1) => void;
};

const SCALE_STEP = 0.25;
const INV_S = 4;
const LOWER = 1.0;
const UPPER = 6.0;

const GuiContext = createContext<GuiCtx | null>(null);

function clamp(n: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, n));
}

function quantize(n: number) {
    return Math.round(n * INV_S) / INV_S;
}

function getInitialGuiScale() {
    const buttonBaseWidth = 210;
    const pagePadding = 64;
    const usableWidth = Math.max(0, window.innerWidth - pagePadding);
    const fitted = usableWidth / buttonBaseWidth;

    return clamp(quantize(fitted), LOWER, 5);
}

function getAutoScale() {
    return clamp(quantize(getInitialGuiScale()), LOWER, UPPER);
}

export function useGui() {
    const ctx = useContext(GuiContext);
    if (!ctx) throw new Error("useGui must be used inside <GuiRoot/>");
    return ctx;
}

export default function GuiRoot(props: { children: React.ReactNode }) {
    const [scale, setScaleRaw] = useState(() => getAutoScale());

    const setScale = (n: number) => {
        const q = clamp(quantize(n), LOWER, UPPER);
        setScaleRaw(q);
    };

    const bump = (dir: 1 | -1) => {
        setScaleRaw((prev) => clamp(quantize(prev + dir * SCALE_STEP), LOWER, UPPER));
    };

    useEffect(() => {
        const onResize = () => {
            setScaleRaw(getAutoScale());
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;

            e.preventDefault();

            const dir: 1 | -1 = e.deltaY < 0 ? 1 : -1;
            setScaleRaw((prev) => clamp(quantize(prev + dir * SCALE_STEP), LOWER, UPPER));
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        return () => window.removeEventListener("wheel", onWheel as EventListener);
    }, []);

    const value = useMemo<GuiCtx>(
        () => ({ scale, setScale, bump }),
        [scale]
    );

    return (
        <GuiContext.Provider value={value}>
            <div className="fixed inset-0 overflow-hidden">
                {props.children}

                <div className="fixed left-0 top-0 z-[9999] rounded-br bg-black/60 px-[4px] py-[1px] text-[16px] text-white">
                    GUI: {scale} (Ctrl + Wheel)
                </div>

                <style>{`
          :root { --guiScale: ${scale}; }

          .guiScaled {
            position: absolute;
            left: 0;
            top: 0;
            transform: scale(var(--guiScale));
            transform-origin: top left;
            width: calc(100vw / var(--guiScale));
            height: calc(100vh / var(--guiScale));
          }
        `}</style>
            </div>
        </GuiContext.Provider>
    );
}