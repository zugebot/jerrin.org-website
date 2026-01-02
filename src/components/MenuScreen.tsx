// src/components/MenuScreen.tsx
import { useMemo } from "react";
import type { MenuKey } from "../data/menu";
import { getMenuSection } from "../data/menu";
import { makeSound } from "../lib/sound";
import MCButton from "./MCButton";
import { MCMenu } from "./MCMenu";

export default function MenuScreen(props: { menuKey: MenuKey; onBack: () => void }) {
    const backSound = useMemo(() => makeSound("/audio/back.wav"), []);
    const section = getMenuSection(props.menuKey);

    const back = () => {
        backSound();
        props.onBack();
    };

    // Unscaled viewport “stage” size. After scaling, it becomes exactly the real viewport.
    const stageStyle: React.CSSProperties = {
        width: "calc(100vw / var(--guiScale))",
        minHeight: "calc(100vh / var(--guiScale))",
    };

    // Visual scaling only (doesn't affect layout); the stageStyle above handles layout.
    const scaledStyle: React.CSSProperties = {
        transform: "scale(var(--guiScale))",
        transformOrigin: "top center",
    };

    // Your “22vh down from top” but stable across scales:
    // apply it in *unscaled* units so after scaling it still looks like 22vh.
    const topPadStyle: React.CSSProperties = {
        paddingTop: "calc(22vh / var(--guiScale))",
    };

    return (
        <div className="fixed inset-0 overflow-y-auto overscroll-contain">
            {/* This box defines scroll/layout in unscaled coords */}
            <div className="mx-auto flex w-full justify-center" style={{ ...stageStyle, ...topPadStyle }}>
                {/* This box is only visual scaling */}
                <div style={scaledStyle}>
                    <MCMenu>
                        <div className="flex flex-col items-center gap-[6px]">
                            {section.items.map((it) => (
                                <MCButton
                                    label={it.label}
                                    iconSrc={it.icon}
                                    onClick={() => window.open(it.href, "_blank", "noopener,noreferrer")}
                                />
                            ))}
                        </div>
                    </MCMenu>
                </div>
            </div>

            {/* Back button: keep your fixed positioning, but don’t use vw/vh for textShadow offsets */}
            <div className="fixed z-[9999] pointer-events-none" style={{ left: "4.8vw", bottom: "4.1vh" }}>
                <div
                    className="pointer-events-auto"
                    style={{
                        transform: "scale(var(--guiScale))",
                        transformOrigin: "bottom left",
                    }}
                >
                    <button onMouseDown={back} className="flex items-center gap-[2px] opacity-50 hover:opacity-90">
                        <img src="/menu/circle.png" alt="" className="h-[14px] w-[14px] mr-[2px]" />
                        <span className="text-[10px] text-[#f5f4f5]" style={{ textShadow: "1px 1px #504f50" }}>
                            Back
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
