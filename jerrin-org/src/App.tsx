// jerrin-org/src/App.tsx
import { useEffect, useMemo, useState } from "react";
import Panorama from "./components/Panorama";
import TitleScreen from "./components/TitleScreen";
import MenuScreen from "./components/MenuScreen";
import { MENU, type MenuKey } from "./data/menu";
import { makeSound } from "./lib/sound";

export default function App() {
    const [screen, setScreen] = useState<"title" | "menu">("title");
    const [menuKey, setMenuKey] = useState<MenuKey>("socials");

    const backSound = useMemo(() => makeSound("/assets/audio/back.wav"), []);

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
        <div className="relative min-h-screen font-mc text-white select-none overflow-x-hidden text-center">
            <Panorama />

            {screen === "title" ? (
                <TitleScreen onOpenMenu={openMenu} />
            ) : (
                <MenuScreen menuKey={menuKey} items={MENU[menuKey]} onBack={goBack} />
            )}
        </div>
    );
}
