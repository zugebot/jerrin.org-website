// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import GuiRoot from "./gui/GuiRoot";
import Panorama from "./components/Panorama";
import TitleScreen from "./components/TitleScreen";
import MenuScreen from "./components/MenuScreen";
import { MENU, type MenuKey } from "./data/menu";
import { makeSound } from "./lib/sound";

export default function App() {
    const [screen, setScreen] = useState<"title" | "menu">("title");
    const [menuKey, setMenuKey] = useState<MenuKey>(() => MENU[0].label);

    const backSound = useMemo(() => makeSound("/audio/back.wav"), []);

    const openMenu = (k: MenuKey) => {
        setMenuKey(k);
        setScreen("menu");
    };

    const goBack = () => {
        backSound();
        setScreen("title");
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === "Escape" && screen === "menu") goBack();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [screen]);

    return (
        <GuiRoot>
            <div className="relative h-full w-full font-mc text-white select-none overflow-hidden text-center">
                <Panorama blurPx={1} />
                {screen === "title" ? (
                    <TitleScreen onOpenMenu={openMenu} />
                ) : (
                    <MenuScreen menuKey={menuKey} onBack={goBack} />
                )}
            </div>
        </GuiRoot>
    );
}
