// src/components/SplashText.tsx
import { useEffect, useRef, useState } from "react";
import { splashes } from "../data/splashes";

/* --- same helper tables --- */
const pixel5 = [
    "A","B","C","D","E","F","G","H","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
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

export default function SplashText() {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const splashMeasureRef = useRef<HTMLSpanElement | null>(null);

    const [rawSplash] = useState(() => splashes[randInt(0, splashes.length - 1)]);
    const [spam, setSpam] = useState("");

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

    return (
        <div ref={rootRef}>
            {/* CSS for splash only */}
            <style>{`
        :root { --text-width: 2vw; }

        #splash {
          pointer-events: none;
          color: #FFFF55;
          font-size: 2vw;
          transform: rotate(343.2deg);
          width: 111vw;

          position: fixed;
          bottom: 65vh;
          right: -4vw;

          text-shadow: calc(var(--text-width)/10) calc(var(--text-width)/10) rgb(79, 86, 6);
          margin: 0;
        }

        #splashSpan {
          position: relative;
          right: -17%;
          bottom: -10%;
          opacity: 0;
          animation: splash-zoom 0.5s infinite;
        }

        @keyframes splash-zoom {
          0%   { font-size: var(--text-width); }
          50%  { font-size: calc(var(--text-width) + 0.1vw); }
          100% { font-size: var(--text-width); }
        }

        @media (orientation: portrait) {
          #splash { display: none; }
        }
      `}</style>

            <h2 id="splash" className="hidden sm:block">
        <span
            id="splashSpan"
            ref={splashMeasureRef}
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
    );
}
