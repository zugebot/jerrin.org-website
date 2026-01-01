export type MenuItem = { label: string; href: string };

export const MENU = {
    socials: [
        { label: "Youtube", href: "https://www.youtube.com/jerrinth3glitch" },
        { label: "Speedrun.com", href: "https://www.speedrun.com/users/jerrinth3glitch" },
        { label: "Discord", href: "https://discord.gg/vGW4pSF8wc" },
        { label: "Replit", href: "https://replit.com/@JerrinShirks" },
        { label: "Github", href: "https://github.com/zugebot" },
    ],
    games: [
        { label: "The Rock Dating Sim", href: "https://www.jerrin.org/apps/rockdatingsim.html" },
        { label: "Chuzzles", href: "https://www.jerrin.org/apps/chuzzles.html" },
        { label: "Isacar's Dream", href: "https://www.jerrin.org/apps/app3.html" },
    ],
    software: [
        { label: "Jerrin's Retiming Tool", href: "https://www.jerrin.org/downloads/retimer/download_page.html" },
    ],
} as const;

export type MenuKey = keyof typeof MENU;
