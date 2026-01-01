import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuKey } from "../data/menu";
import { makeSound } from "../lib/sound";
import { splashes } from "../data/splashes";

/* --- your same helper tables --- */
const pixel5 = ["A","B","C","D","E","F","G","H","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
    "a","b","c","d","e","g","h","j","m","n","o","p","q","r","s","u","v","w","x","y","z",
    "0","1","2","3","4","5","6","7","8","9","#","$","%","&","*","+","-","/","<","=",">","?","@","\\","^","_","~"
];

const colorList = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
const colors = ["#000000","#0000AA","#00AA00","#00AAAA","#AA0000","#AA00AA","#FFAA00","#AAAAAA","#555555","#5555FF","#55FF55","#55FFFF","#FF5555","#FF55FF","#FFFF55","#FFFFFF"];
const colorShadows = ["#000000","#030222","#032701","#0a2d27","#230507","#240c22","#242506","#242506","#181818","#151345","#0e3d0f","#114340","#491112","#3d1839","#504f50","#595647"];

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spamString() {
    let t = "";
    t += pixel5[randInt(0, pixel5.length - 1)];
    t += pixel5[randInt(0, pixel5.length - 1)];
    t += pixel5[randInt(0, pixel5.length - 1)];
    t += pixel5[randInt(0, pixel5.length - 1)];
    t += pixel5[randInt(0, pixel5.length - 1)] + " ";
    t += pixel5[randInt(0, pixel5.length - 1)];
    t += pixel5[randInt(0, pixel5.length - 1)];
    t += pixel5[randInt(0, pixel5.length - 1)];
    return t;
}

function parseColorSplash(raw: string) {
    const out: { code: string; ch: string }[] = [];
    for (let i = 0; i + 2 < raw.length; i++) {
        if (raw[i] === "§") {
            const code = raw[i + 1];
            const ch = raw[i + 2];
            if (colorList.includes(code)) out.push({ code, ch });
            i += 2;
        }
    }
    return out;
}

function computeTextWidthVW(spanPx: number) {
    if (!spanPx) return "2vw";
    const w = 1000 / spanPx;
    return `${Math.min(5, w)}vw`;
}

export default function TitleScreen(props: { onOpenMenu: (k: MenuKey) => void }) {
    const hoverSound = useMemo(() => makeSound("/assets/audio/focus.wav"), []);
    const clickSound = useMemo(() => makeSound("/assets/audio/press.wav"), []);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const splashMeasureRef = useRef<HTMLSpanElement | null>(null);

    const [rawSplash] = useState(() => splashes[randInt(0, splashes.length - 1)]);
    const [spam, setSpam] = useState<string>("");

    const isSpam = rawSplash.includes("§k");
    const isColor = rawSplash.includes("§1");

    useEffect(() => {
        if (!isSpam) return;
        const clean = rawSplash.replaceAll("§k", "");
        setSpam(clean || spamString());
        const h = window.setInterval(() => setSpam(spamString()), 10);
        return () => window.clearInterval(h);
    }, [isSpam, rawSplash]);

    useEffect(() => {
        const root = rootRef.current;
        const el = splashMeasureRef.current;
        if (!root || !el) return;

        const measure = () => {
            const px = el.offsetWidth;
            root.style.setProperty("--text-width", computeTextWidthVW(px));
            el.style.opacity = "1";
        };

        measure();
        const t = window.setTimeout(measure, 60);
        return () => window.clearTimeout(t);
    }, [rawSplash, spam]);

    const open = (k: MenuKey) => {
        clickSound();
        props.onOpenMenu(k);
    };

    return (
        <div ref={rootRef} className="relative">
            {/* Title + Splash */}
            <div className="mx-auto w-full">
                <div className="relative mx-auto w-fit">
                    <img
                        src="/assets/title.png"
                        alt="Title"
                        className="mx-auto mt-[8vh] h-auto w-[min(100vw,1000px)]"
                    />

                    {/* hide splash on portrait/small like your media query */}
                    <h2
                        className="hidden sm:block pointer-events-none absolute bottom-[65vh] right-[-4vw] w-[111vw] rotate-[343.2deg] text-[#FFFF55]"
                        style={{
                            textShadow: "calc(var(--text-width)/10) calc(var(--text-width)/10) rgb(79, 86, 6)",
                            fontSize: "2vw",
                        }}
                    >
            <span
                ref={splashMeasureRef}
                className="inline-block opacity-0 animate-splashZoom"
                style={{ animationPlayState: "running" }}
            >
              {!isSpam && !isColor && rawSplash}
                {isSpam && spam}
                {isColor &&
                    parseColorSplash(rawSplash).map((p, i) => {
                        const idx = colorList.indexOf(p.code);
                        const col = colors[idx] ?? "#fff";
                        const sh = colorShadows[idx] ?? "#000";
                        return (
                            <span
                                key={i}
                                style={{
                                    color: col,
                                    textShadow: `calc(var(--text-width)/10) calc(var(--text-width)/10) ${sh}`,
                                }}
                            >
                      {p.ch}
                    </span>
                        );
                    })}
            </span>
                    </h2>
                </div>

                {/* Title buttons */}
                <div className="mt-[10vh] flex flex-col items-center gap-[1.5vh]">
                    <button
                        className="mc-btn w-[35vw] h-[3vw] text-[1.5vw] text-[#f5f4f5]"
                        onMouseEnter={hoverSound}
                        onMouseDown={() => open("socials")}
                    >
                        Socials
                    </button>

                    <button
                        className="mc-btn w-[35vw] h-[3vw] text-[1.5vw] text-[#f5f4f5]"
                        onMouseEnter={hoverSound}
                        onMouseDown={() => open("games")}
                    >
                        Games
                    </button>

                    <button
                        className="mc-btn w-[35vw] h-[3vw] text-[1.5vw] text-[#f5f4f5]"
                        onMouseEnter={hoverSound}
                        onMouseDown={() => open("software")}
                    >
                        Software
                    </button>
                </div>

                {/* portrait rules from your CSS */}
                <style>{`
          @media (orientation: portrait) {
            .mc-btn {
              width: 100vw !important;
              height: 20vw !important;
              font-size: 10vw !important;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
