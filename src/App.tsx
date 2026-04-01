// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import GuiRoot from "./gui/GuiRoot";
import Panorama from "./components/Panorama";
import TitleScreen from "./components/TitleScreen";
import MenuScreen from "./components/MenuScreen";
import { MENU, type MenuKey } from "./data/menu";
import { makeSound } from "./lib/sound";
import MudaePage from "./pages/MudaePage";
import {preloadAudio, preloadImage} from "./lib/preload.ts";

function HomePage() {
    const [screen, setScreen] = useState<"title" | "menu">("title");
    const [menuKey, setMenuKey] = useState<MenuKey>(() => MENU[0].label);
    const [assetsReady, setAssetsReady] = useState(false);

    const backSound = useMemo(() => makeSound("/audio/back.wav", 0.5), []);

    useEffect(() => {
        const iconSources = MENU.flatMap((section) =>
            section.items.map((item) => item.icon)
        );

        const imageSources = [
            "/title.png",
            "/menu/BG_Button.png",
            "/menu/BB_Button.png",
            "/menu/a_enchant_purple.png",
            "/menu/Menu_Top204.png",
            "/menu/Menu_Center204.png",
            "/menu/Menu_Bottom204.png",

            ...iconSources,
        ];

        const audioSources = [
            "/audio/back.wav",
            "/audio/focus.wav",
            "/audio/press.wav",
        ];

        let cancelled = false;

        async function loadAssets() {
            try {
                await Promise.all([
                    ...imageSources.map((src) => preloadImage(src)),
                    ...audioSources.map((src) => preloadAudio(src, 0.5).then(() => {})),
                ]);
            } catch (err) {
                console.error("Asset preload failed:", err);
            } finally {
                if (!cancelled) {
                    setAssetsReady(true);
                }
            }
        }

        void loadAssets();

        return () => {
            cancelled = true;
        };
    }, []);

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
    }, [screen, backSound]);

    return (
        <GuiRoot>
            <div className="relative h-full w-full select-none overflow-hidden text-center font-mc text-white">
                <Panorama blurPx={1}/>

                {!assetsReady ? (
                    <div className="rounded bg-black/60 px-4 py-2 text-white">
                        Loading...
                    </div>
                ) : screen === "title" ? (
                    <TitleScreen onOpenMenu={openMenu}/>
                ) : (
                    <MenuScreen menuKey={menuKey} onBack={goBack}/>
                )}
            </div>
        </GuiRoot>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/mudae" element={<MudaePage/>}/>
        </Routes>
    );
}