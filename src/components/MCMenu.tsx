// src/components/MCMenu.tsx
import React from "react";

export type MCMenuProps = {
    children: React.ReactNode;
    className?: string;

    /** Vertical padding in GUI pixels (unscaled). Default 5. */
    padY?: number;

    /** Horizontal padding in GUI pixels (unscaled). Default 3. */
    padX?: number;
};

/**
 * Top/Bottom are 176x4.
 * Center is 176x1 (tiles vertically).
 *
 * IMPORTANT:
 * If you scale the whole menu with `transform: scale(var(--guiScale))`,
 * then padding must be specified in *unscaled* GUI pixels (NOT multiplied by guiScale),
 * otherwise it scales twice (scale^2).
 */
export function MCMenu({
                           children,
                           className = "",
                           padY = 1,
                           padX = 5,
                       }: MCMenuProps) {
    return (
        <div className={`w-full ${className}`}>
            {/* TOP (176x4) */}
            <img
                src="/menu/Menu_Top204.png"
                alt=""
                draggable={false}
                className="pointer-events-none block w-full h-auto select-none"
                style={{ imageRendering: "pixelated" }}
            />

            {/* CENTER (176x1) */}
            <div className="relative w-full">
                {/* tiled background layer */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: "url(/menu/Menu_Center204.png)",
                        backgroundRepeat: "repeat-y",
                        backgroundPosition: "top left",
                        // stretch to full width; keep the slice 1px tall so tiling stays crisp
                        backgroundSize: "100% 1px",
                        imageRendering: "pixelated",
                    }}
                />

                {/* content */}
                <div
                    className="relative w-full"
                    style={{
                        paddingTop: padY,
                        paddingBottom: padY,
                        paddingLeft: padX,
                        paddingRight: padX,
                    }}
                >
                    {children}
                </div>
            </div>

            {/* BOTTOM (176x4) */}
            <img
                src="/menu/Menu_Bottom204.png"
                alt=""
                draggable={false}
                className="pointer-events-none block w-full h-auto select-none"
                style={{ imageRendering: "pixelated" }}
            />
        </div>
    );
}
