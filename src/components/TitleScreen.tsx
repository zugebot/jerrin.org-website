// src/components/TitleScreen.tsx
import type { MenuKey } from "../data/menu";
import { MENU } from "../data/menu";
import MCButton from "./MCButton";

export default function TitleScreen(props: { onOpenMenu: (k: MenuKey) => void }) {
    return (
        <div className="relative w-full">
            <div className="mb-[10vh] flex w-full justify-center">
                <img
                    src="/title.png"
                    alt="Title"
                    className="mt-[8vh] block h-[15vh] w-auto max-w-none portrait:h-auto portrait:w-[85%]"
                />
            </div>

            <div className="guiScaled mt-[30vh] flex flex-col items-center gap-2">
                {MENU.map((section) => (
                    <div key={section.label}>
                        <MCButton
                            label={`${section.label} [${section.items.length}]`}
                            onClick={() => props.onOpenMenu(section.label)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}