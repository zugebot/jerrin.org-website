// src/components/TitleScreen.tsx
import type { MenuKey } from "../data/menu";
import { MENU } from "../data/menu";
import MCButton from "./MCButton";
import SplashText from "./SplashText";

export default function TitleScreen(props: { onOpenMenu: (k: MenuKey) => void }) {
    return (
        <div className="relative">
            {/* TitleScreen-only CSS */}
            <style>{`
        #titleText {
          height: 15vh;
          margin-top: 8vh;
          width: auto;
          max-width: none;
          display: block;
        }

        #titleWrap {
          width: fit-content;
          margin: auto;
          margin-bottom: 10vh;
        }

        @media (orientation: portrait) {
          #titleText {
            width: 100vw;
            height: fit-content !important;
          }
          .mc-btn {
            width: 100vw !important;
            height: 20vw !important;
            font-size: 10vw !important;
          }
        }
      `}</style>

            {/* Title */}
            <div id="titleWrap">
                <img id="titleText" src="/title.png" alt="Title" />
            </div>

            {/* Splash is now separate */}
            {/*<SplashText />*/}

            {/* Buttons come from MENU config */}
            <div className="guiScaled mt-[30vh] flex flex-col items-center gap-[8px]">
                {MENU.map((section) => (
                    <MCButton
                        label={section.label + " [" + section.items.length + "]"}
                        onClick={() => props.onOpenMenu(section.label)}
                    />
                ))}
            </div>
        </div>
    );
}
