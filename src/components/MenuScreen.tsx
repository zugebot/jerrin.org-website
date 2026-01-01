// src/components/MenuScreen.tsx
import { useMemo } from "react";
import type { MenuKey } from "../data/menu";
import { getMenuSection } from "../data/menu";
import { makeSound } from "../lib/sound";
import MCButton from "./MCButton";

// function iconPath(menu: MenuKey, label: string) {
//     // your folders are lower-case: /icons/socials/..., /icons/games/..., /icons/software/...
//     return `/icons/${menu.toLowerCase()}/${label.toLowerCase()}.png`;
// }

export default function MenuScreen(props: { menuKey: MenuKey; onBack: () => void }) {
    const backSound = useMemo(() => makeSound("/audio/back.wav"), []);
    const section = getMenuSection(props.menuKey);

    const back = () => {
        backSound();
        props.onBack();
    };

    return (
        <div className="fixed inset-0">
            <div className="mx-auto mt-[22vh] w-full flex justify-center">
                {/* scale ONLY the contents */}
                <div
                    style={{
                        transform: "scale(var(--guiScale))",
                        transformOrigin: "top center",
                    }}
                >
                    <div className="flex flex-col gap-[6px] items-center">
                        {section.items.map((it) => (
                            <MCButton
                                label={it.label}
                                iconSrc={it.icon}
                                onClick={() => window.open(it.href, "_blank", "noopener,noreferrer")}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div
                className="fixed z-[9999] pointer-events-none"
                style={{left: "4.8vw", bottom: "4.1vh"}}
            >
                {/* scaled contents (SCALED) */}
                <div
                    className="pointer-events-auto"
                    style={{
                        transform: "scale(var(--guiScale))",
                        transformOrigin: "bottom left",
                    }}
                >
                    <button
                        onMouseDown={back}
                        className="flex items-center gap-[0.15vw] opacity-50 hover:opacity-90"
                    >
                        <img src="/menu/circle.png" alt="" className="w-[14px] h-[14px] mr-[2px]"/>
                        <span
                            className="text-[10px] text-[#f5f4f5]"
                            style={{textShadow: "0.15vw 0.15vw #504f50"}}
                        >
                            Back
                        </span>
                    </button>
                </div>
            </div>


        </div>
    );
}