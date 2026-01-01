import { useMemo } from "react";
import type { MenuItem, MenuKey } from "../data/menu";
import { makeSound } from "../lib/sound";

function iconPath(menu: MenuKey, label: string) {
    // matches your old: ./assets/icons/${name}/${element[0].toLowerCase()}.png
    return `/assets/icons/${menu}/${label.toLowerCase()}.png`;
}

export default function MenuScreen(props: {
    menuKey: MenuKey;
    items: readonly MenuItem[];
    onBack: () => void;
}) {
    const backSound = useMemo(() => makeSound("/assets/audio/back.wav"), []);

    const back = () => {
        backSound();
        props.onBack();
    };

    return (
        <div className="fixed inset-0">
            <div className="mx-auto mt-[11vh] h-[50vh] w-[48.5vw]">
                <div className="mt-[12vw] flex flex-col gap-[1.4vh]">
                    {props.items.map((it) => (
                        <a
                            key={it.label}
                            href={it.href}
                            target="_blank"
                            rel="noreferrer"
                            className="mc-link mx-auto relative inline-block w-[42.5vw] h-[4.7vw] no-underline text-[#f5f4f5] text-[1.5vw] text-left"
                        >
                            <img
                                src={iconPath(props.menuKey, it.label)}
                                alt=""
                                className="absolute left-[1.1vw] top-[0.6vw] w-[3.3vw] h-[3.3vw]"
                            />
                            <span className="absolute left-[1.7vw] top-1/2 -translate-y-1/2 ml-[3.6vw]">
                {it.label}
              </span>
                        </a>
                    ))}
                </div>
            </div>

            <button
                onMouseDown={back}
                className="fixed bottom-[4.1vh] left-[4.8vw] flex items-center gap-[0.15vw] opacity-50 hover:opacity-90"
            >
                <img src="/assets/circle.png" alt="" className="w-[4.1vh] h-[4.1vh]" />
                <span className="text-[2vw] text-[#f5f4f5]" style={{ textShadow: "0.15vw 0.15vw #504f50" }}>
          Back
        </span>
            </button>
        </div>
    );
}
