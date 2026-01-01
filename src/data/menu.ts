// src/data/menu.ts
export type MenuItem = { label: string; href: string };

export const MENU = [
    {
        label: "Socials",
        items: [
            { label: "LinkedIn", icon: "/icons/socials/handshake.jpg", href: "https://app.joinhandshake.com/profiles/jerrin" },
            { label: "Handshake", icon: "/icons/socials/LinkedIn_icon.svg.png", href: "https://www.linkedin.com/in/jerrin-shirks-69b697283/" },
            { label: "Youtube", icon: "/icons/socials/youtube.png", href: "https://www.youtube.com/jerrinth3glitch" },
            { label: "Speedrun.com", icon: "/icons/socials/speedrun.com.png", href: "https://www.speedrun.com/users/jerrinth3glitch" },
            { label: "Discord", icon: "/icons/socials/discord.png", href: "https://discord.gg/vGW4pSF8wc" },
            { label: "Replit", icon: "/icons/socials/replit.png", href: "https://replit.com/@JerrinShirks" },
            { label: "Github", icon: "/icons/socials/github.png", href: "https://github.com/zugebot" },
        ],
    },
    {
        label: "Games",
        items: [
            { label: "The Rock Dating Sim", icon: "icons/games/the rock dating sim.png", href: "/apps/rockdatingsim/index.html" }
        ],
    },
    {
        label: "Software",
        items: [{ label: "Jerrin's Retiming Tool", icon: "icons/software/jerrin's retiming tool.png", href: "/downloads/retimer/download_page.html" }],
    },
    {
        label: "Web-Tools",
        items: [
            { label: "9x9 Puzzle Solver", icon: "icons/games/9x9 puzzle.png", href: "/apps/9x9Puzzle/index.html" },
            { label: "Mudae '$oc' Solver", icon: "icons/web-tools/orb_red.webp", href: "/apps/mudae/oc/index.html" },
            { label: "Mudae '$oq' Solver", icon: "icons/web-tools/orb_purple.webp", href: "/apps/mudae/oq/index.html" }
        ],
    },
] as const;

export type MenuSection = (typeof MENU)[number];
export type MenuKey = MenuSection["label"]; // "Socials" | "Games" | "Software"
export type MenuItemsFor<K extends MenuKey> = Extract<MenuSection, { label: K }>["items"];

export function getMenuSection<K extends MenuKey>(key: K): Extract<MenuSection, { label: K }> {
    const s = MENU.find((x) => x.label === key);
    if (!s) throw new Error(`Unknown menu key: ${key}`);
    return s as Extract<MenuSection, { label: K }>;
}
