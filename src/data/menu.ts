export type MenuItem = {
    label: string;
    icon: string;
    href: string;
};

export type MenuSection = {
    label: string;
    items: readonly MenuItem[];
};

export const MENU = [
    {
        label: "Socials",
        items: [
            { label: "Handshake", icon: "/icons/socials/handshake.jpg", href: "https://app.joinhandshake.com/profiles/jerrin" },
            { label: "LinkedIn", icon: "/icons/socials/LinkedIn_icon.svg.png", href: "https://www.linkedin.com/in/jerrin-shirks-69b697283/" },
            { label: "Youtube", icon: "/icons/socials/youtube.png", href: "https://www.youtube.com/jerrinth3glitch" },
            { label: "Speedrun.com", icon: "/icons/socials/speedrun.com.png", href: "https://www.speedrun.com/users/jerrinth3glitch" },
            { label: "Discord", icon: "/icons/socials/discord.png", href: "https://discord.gg/vGW4pSF8wc" },
            { label: "Replit", icon: "/icons/socials/replit.png", href: "https://replit.com/@JerrinShirks" },
            { label: "Github", icon: "/icons/socials/github.png", href: "https://github.com/zugebot" },
        ],
    },
    {
        label: "Games & Tools",
        items: [
            { label: "The Rock Dating Sim", icon: "icons/games/the rock dating sim.png", href: "/apps/rockdatingsim/index.html" },
            { label: "Renderer", icon: "icons/games/snow.jpg", href: "/apps/renderer/app.html" },
            { label: "Mudae $oc/$oq/$ot Solver", icon: "icons/web-tools/orb_red.webp", href: "/mudae" },
            { label: "9x9 Puzzle Solver", icon: "icons/games/9x9 puzzle.png", href: "/apps/9x9Puzzle/index.html" }
        ],
    },
    {
        label: "Software",
        items: [
            { label: "Jerrin's Retiming Tool", icon: "icons/software/jerrin's retiming tool.png", href: "/downloads/retimer/download_page.html" }
        ],
    },
    {
        label: "Discord-Bots",
        items: [
            { label: "Jerrinth Bot", icon: "icons/discord-bots/Jerrinth Bot.png", href: "https://discord.com/oauth2/authorize?client_id=856411268633329684&permissions=0&scope=applications.commands+bot" },
            { label: "ChuzzOS", icon: "icons/discord-bots/ChuzzOS.webp", href: "https://discord.com/oauth2/authorize?client_id=1121576095637049475&permissions=8&scope=bot+applications.commands" },
        ],
    },
] as const satisfies readonly MenuSection[];

export type MenuKey = MenuSection["label"];

export function getMenuSection(key: MenuKey): MenuSection {
    const s = MENU.find((x) => x.label === key);
    if (!s) throw new Error(`Unknown menu key: ${key}`);
    return s;
}