import { useMemo } from "react";
import type { MenuKey } from "../data/menu";
import { getMenuSection } from "../data/menu";
import { makeSound } from "../lib/sound";
import MCButton from "./MCButton";
import { MCMenu } from "./MCMenu";

export default function MenuScreen(props: { menuKey: MenuKey; onBack: () => void }) {
    const backSound = useMemo(() => makeSound("/audio/back.wav", 0.5), []);
    const section = getMenuSection(props.menuKey);

    const back = () => {
        backSound();
        props.onBack();
    };

    return (
        <>
            <div className="flex h-full w-full items-center justify-center">
                <div
                    className="flex flex-col items-center"
                    style={{
                        transform: "scale(var(--guiScale))",
                        transformOrigin: "center center",
                    }}
                >
                    <MCMenu>
                        <div className="flex flex-col items-center gap-[6px]">
                            {section.items.map((it) => (
                                <div key={it.label}>
                                    <MCButton
                                        label={it.label}
                                        iconSrc={it.icon}
                                        onClick={() => {
                                            if (it.href.startsWith("/")) {
                                                window.location.href = it.href;
                                            } else {
                                                window.open(it.href, "_blank", "noopener,noreferrer");
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </MCMenu>
                </div>
            </div>

            <div className="pointer-events-none fixed bottom-[4.1vh] left-[4.8vw] z-[9999]">
                <div
                    className="pointer-events-auto"
                    style={{
                        transform: "scale(var(--guiScale))",
                        transformOrigin: "bottom left",
                    }}
                >
                    <button
                        onMouseDown={back}
                        type="button"
                        className="flex items-center gap-[2px] opacity-50 hover:opacity-90"
                    >
                        <img src="/menu/circle.png" alt="" className="mr-[2px] h-[14px] w-[14px]" />
                        <span className="text-[10px] text-[#f5f4f5]" style={{ textShadow: "1px 1px #504f50" }}>
                            Back
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}