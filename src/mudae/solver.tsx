import React, { useEffect, useMemo, useState } from "react";

const ICONS = {
    Purple: "https://cdn.discordapp.com/emojis/1437140625844867244.webp",
    Blue: "https://cdn.discordapp.com/emojis/1437140639987929108.webp",
    Teal: "https://cdn.discordapp.com/emojis/1437140651614535680.webp",
    Green: "https://cdn.discordapp.com/emojis/1437140664193126441.webp",
    Yellow: "https://cdn.discordapp.com/emojis/1437140677187338310.webp",
    Orange: "https://cdn.discordapp.com/emojis/1437140688608432185.webp",
    Red: "https://cdn.discordapp.com/emojis/1437140700604137554.webp",
    White: "https://cdn.discordapp.com/emojis/1437140737459486780.webp",
    Black: "https://cdn.discordapp.com/emojis/1437140725492879471.webp",
    Mystery: "https://cdn.discordapp.com/emojis/1437140748423270441.webp",
} as const;

type IconKey = keyof typeof ICONS;
type CellMark = IconKey | null;
type Board = CellMark[][];
type SolverTab = "oc" | "oq" | "ot" | "ocscore" | "oqscore";

type PaletteInk = {
    key: string;
    icon?: string;
};

const N = 5;

function makeEmptyBoard(size = N): Board {
    return Array.from({ length: size }, () => Array(size).fill(null));
}

function cn(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

function percentText(prob: number) {
    if (prob <= 0) return "0%";

    const pct = prob * 100;

    if (pct < 1) return "<1%";

    return `${Math.round(pct)}%`;
}

function mixColor(from: [number, number, number], to: [number, number, number], t: number) {
    const clamped = Math.max(0, Math.min(1, t));
    const r = Math.round(from[0] + (to[0] - from[0]) * clamped);
    const g = Math.round(from[1] + (to[1] - from[1]) * clamped);
    const b = Math.round(from[2] + (to[2] - from[2]) * clamped);
    return `rgb(${r}, ${g}, ${b})`;
}

function AppTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="mb-1 mt-1 text-center font-bold leading-none text-[#dbdee1] text-2xl sm:text-3xl">{children}</h2>;
}

function Subtitle({ children }: { children: React.ReactNode }) {
    return <p className="mb-4 max-w-[760px] text-center text-[0.72rem] text-[#dbdee1]/75">{children}</p>;
}

function Icon({ src, className }: { src: string; className?: string }) {
    return <img src={src} alt="" className={cn("pointer-events-none select-none", className)} draggable={false} />;
}

function SolverShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-full overflow-auto bg-[#313338] p-5 text-[#dbdee1]">
            <div className="mx-auto flex w-fit flex-col items-center justify-center [zoom:0.85] sm:[zoom:1.00] md:[zoom:1.25] lg:[zoom:1.5] xl:[zoom:1.75]">
                {children}
            </div>
        </div>
    );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("rounded-xl bg-[#2b2d31]", className)}>{children}</div>;
}

function PaletteButton({ active, clear, icon, label, onClick }: { active?: boolean; clear?: boolean; icon?: string; label?: string; onClick: () => void; }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex h-11 w-14 items-center justify-center rounded-[10px] border-2 transition duration-100",
                clear
                    ? "border-white/15 bg-gradient-to-b from-[#f05a5d] to-[#d83c3f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_1px_rgba(0,0,0,0.18)]"
                    : "border-white/10 bg-white/5 hover:opacity-90",
                active && !clear && "-translate-y-px border-white/95 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.18),0_0_14px_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(255,255,255,0.12)]"
            )}
        >
            {clear ? <span className="text-[0.95rem] font-medium">{label ?? "Clear"}</span> : <Icon src={icon!} className="h-[26px] w-[26px]" />}
        </button>
    );
}

function Palette({ inks, currentInk, onSelect, onClear }: { inks: PaletteInk[]; currentInk: string; onSelect: (ink: string) => void; onClear: () => void; }) {
    return (
        <Panel className="mb-[10px] grid grid-cols-4 gap-[10px] p-[14px]">
            {inks.map((ink, i) => (
                <React.Fragment key={`${ink.key}-${i}`}>
                    <PaletteButton
                        active={ink.key === currentInk}
                        clear={ink.key === "Clear"}
                        icon={ink.icon}
                        label="Clear"
                        onClick={() => {
                            if (ink.key === "Clear") {
                                onClear();
                            } else {
                                onSelect(ink.key);
                            }
                        }}
                    />
                </React.Fragment>
            ))}
        </Panel>
    );
}

function SolverTabs({ value, onChange }: { value: SolverTab; onChange: (v: SolverTab) => void }) {
    const tabs: Array<{ key: SolverTab; label: string }> = [
        { key: "oc", label: "$oc" },
        { key: "oq", label: "$oq" },
        { key: "ot", label: "$ot" },
        { key: "ocscore", label: "$oc EV" },
        { key: "oqscore", label: "$oq EV" },
    ];

    return (
        <div className="mb-1 inline-flex w-fit self-center rounded-xl bg-[#2b2d31]">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={cn(
                        "rounded-lg px-2 py-1 text-sm font-semibold transition",
                        value === tab.key ? "bg-white/10 text-white shadow-inner" : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

function OqSolver() {
    const TOTAL_PURPLES = 4;
    const FREE_PURPLES = 3;
    const MAX_CLICKS = 7;

    const CLUE_VALUE: Record<string, number> = {
        Blue: 0,
        Teal: 1,
        Green: 2,
        Yellow: 3,
        Orange: 4,
    };

    const VALUE_CLUE: Record<number, "Blue" | "Teal" | "Green" | "Yellow" | "Orange"> = {
        0: "Blue",
        1: "Teal",
        2: "Green",
        3: "Yellow",
        4: "Orange",
    };

    const paletteInks: PaletteInk[] = [
        { key: "None", icon: ICONS.Mystery },
        { key: "Purple", icon: ICONS.Purple },
        { key: "Blue", icon: ICONS.Blue },
        { key: "Teal", icon: ICONS.Teal },
        { key: "Green", icon: ICONS.Green },
        { key: "Yellow", icon: ICONS.Yellow },
        { key: "Orange", icon: ICONS.Orange },
        { key: "Clear" },
    ];

    const [board, setBoard] = useState<Board>(() => makeEmptyBoard());
    const [currentInk, setCurrentInk] = useState("None");
    const [purpleOrder, setPurpleOrder] = useState<number[]>([]);
    const [showKakeraBoxes, setShowKakeraBoxes] = useState(false);

    const getCellId = (r: number, c: number) => r * N + c;

    const countPurples = (src: Board) => src.flat().filter((x) => x === "Purple").length;

    const getKnownPurpleSet = (src: Board) => {
        const out: number[] = [];

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (src[r][c] === "Purple") out.push(getCellId(r, c));
            }
        }

        return out;
    };

    const getNeighborCount = (purpleSet: number[], id: number) => {
        const rr = Math.floor(id / N);
        const cc = id % N;

        let count = 0;

        for (const x of purpleSet) {
            const r = Math.floor(x / N);
            const c = x % N;

            if (r === rr && c === cc) continue;
            if (Math.abs(r - rr) <= 1 && Math.abs(c - cc) <= 1) count++;
        }

        return count;
    };

    const countChargedClicks = (src: Board) => {
        const purples = countPurples(src);
        const clueClicks = src.flat().filter((x) => x && x !== "Purple").length;
        const chargedPurpleClicks = Math.max(0, purples - FREE_PURPLES);

        return clueClicks + chargedPurpleClicks;
    };

    const getOqTextColor = (
        kind: "Purple" | "Red" | "Blue" | "Teal" | "Green" | "Yellow" | "Orange",
        value: number,
        maxValue: number
    ) => {
        if (value <= 0 || maxValue <= 0) return "rgb(219, 222, 225)";

        const normalized = value / maxValue;
        const curved = Math.pow(normalized, 4);

        const paleMap = {
            Purple: [225, 218, 238] as [number, number, number],
            Red: [235, 220, 220] as [number, number, number],
            Blue: [220, 226, 236] as [number, number, number],
            Teal: [210, 236, 236] as [number, number, number],
            Green: [214, 236, 214] as [number, number, number],
            Yellow: [236, 235, 210] as [number, number, number],
            Orange: [236, 226, 214] as [number, number, number],
        };

        const vividMap = {
            Purple: [185, 120, 255] as [number, number, number],
            Red: [255, 70, 70] as [number, number, number],
            Blue: [110, 155, 255] as [number, number, number],
            Teal: [72, 225, 225] as [number, number, number],
            Green: [85, 235, 85] as [number, number, number],
            Yellow: [255, 235, 40] as [number, number, number],
            Orange: [255, 170, 55] as [number, number, number],
        };

        return mixColor(paleMap[kind], vividMap[kind], curved);
    };

    const solveBoard = (src: Board) => {
        const must: number[] = [];
        const forbid: number[] = [];
        const clues: Array<{ id: number; req: number }> = [];

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const mark = src[r][c];
                const id = getCellId(r, c);

                if (mark === "Purple") {
                    must.push(id);
                } else if (mark) {
                    forbid.push(id);
                    clues.push({ id, req: CLUE_VALUE[mark] ?? -1 });
                }
            }
        }

        const emptyPct = Array.from({ length: N }, () => Array(N).fill(0));
        const emptyCluePct: Record<"Blue" | "Teal" | "Green" | "Yellow" | "Orange", number[][]> = {
            Blue: Array.from({ length: N }, () => Array(N).fill(0)),
            Teal: Array.from({ length: N }, () => Array(N).fill(0)),
            Green: Array.from({ length: N }, () => Array(N).fill(0)),
            Yellow: Array.from({ length: N }, () => Array(N).fill(0)),
            Orange: Array.from({ length: N }, () => Array(N).fill(0)),
        };

        if (must.length > TOTAL_PURPLES) {
            return {
                total: 0,
                purplePct: emptyPct,
                cluePct: emptyCluePct,
                completions: [] as number[][],
            };
        }

        let total = 0;
        const purpleCounts = Array(N * N).fill(0);
        const clueCounts: Record<"Blue" | "Teal" | "Green" | "Yellow" | "Orange", number[]> = {
            Blue: Array(N * N).fill(0),
            Teal: Array(N * N).fill(0),
            Green: Array(N * N).fill(0),
            Yellow: Array(N * N).fill(0),
            Orange: Array(N * N).fill(0),
        };

        const completions: number[][] = [];

        for (let a = 0; a < 25; a++) {
            for (let b = a + 1; b < 25; b++) {
                for (let c = b + 1; c < 25; c++) {
                    for (let d = c + 1; d < 25; d++) {
                        const set = [a, b, c, d];

                        if (!must.every((x) => set.includes(x))) continue;
                        if (forbid.some((x) => set.includes(x))) continue;

                        let ok = true;

                        for (const clue of clues) {
                            if (clue.req < 0 || getNeighborCount(set, clue.id) !== clue.req) {
                                ok = false;
                                break;
                            }
                        }

                        if (!ok) continue;

                        total++;
                        completions.push(set);
                        set.forEach((x) => purpleCounts[x]++);

                        const setLookup = new Set(set);

                        for (let id = 0; id < 25; id++) {
                            if (setLookup.has(id)) continue;

                            const count = Math.min(getNeighborCount(set, id), 4);
                            const clueColor = VALUE_CLUE[count];
                            clueCounts[clueColor][id]++;
                        }
                    }
                }
            }
        }

        const purplePct = Array.from({ length: N }, () => Array(N).fill(0));
        const cluePct: Record<"Blue" | "Teal" | "Green" | "Yellow" | "Orange", number[][]> = {
            Blue: Array.from({ length: N }, () => Array(N).fill(0)),
            Teal: Array.from({ length: N }, () => Array(N).fill(0)),
            Green: Array.from({ length: N }, () => Array(N).fill(0)),
            Yellow: Array.from({ length: N }, () => Array(N).fill(0)),
            Orange: Array.from({ length: N }, () => Array(N).fill(0)),
        };

        if (total > 0) {
            for (let id = 0; id < 25; id++) {
                const r = Math.floor(id / N);
                const c = id % N;

                purplePct[r][c] = purpleCounts[id] / total;
                cluePct.Blue[r][c] = clueCounts.Blue[id] / total;
                cluePct.Teal[r][c] = clueCounts.Teal[id] / total;
                cluePct.Green[r][c] = clueCounts.Green[id] / total;
                cluePct.Yellow[r][c] = clueCounts.Yellow[id] / total;
                cluePct.Orange[r][c] = clueCounts.Orange[id] / total;
            }
        }

        return { total, purplePct, cluePct, completions };
    };

    const analysis = useMemo(() => solveBoard(board), [board]);

    const canPlaceMarkAt = (src: Board, r: number, c: number, value: CellMark) => {
        const current = src[r][c];

        if (current === value) return true;

        const copy = src.map((row) => [...row]);
        copy[r][c] = value;

        if (countPurples(copy) > TOTAL_PURPLES) return false;
        if (countChargedClicks(copy) > MAX_CLICKS) return false;

        if (value && value !== "Purple") {
            const req = CLUE_VALUE[value] ?? -1;
            if (req < 0) return false;

            const id = getCellId(r, c);
            let canEverMatch = false;

            for (const completion of solveBoard(copy).completions) {
                if (getNeighborCount(completion, id) === req) {
                    canEverMatch = true;
                    break;
                }
            }

            if (!canEverMatch) return false;
        }

        return solveBoard(copy).total > 0;
    };

    function onCellClick(r: number, c: number) {
        setBoard((prev) => {
            const nextValue = currentInk === "None" ? null : (currentInk as CellMark);

            if (!canPlaceMarkAt(prev, r, c, nextValue)) return prev;

            const id = getCellId(r, c);
            const next = prev.map((row) => [...row]);
            next[r][c] = nextValue;

            setPurpleOrder((oldOrder) => {
                let nextOrder = oldOrder.filter((x) => x !== id);

                if (nextValue === "Purple") {
                    nextOrder = [...nextOrder, id];
                }

                const livePurples = new Set(getKnownPurpleSet(next));
                nextOrder = nextOrder.filter((x) => livePurples.has(x));

                return nextOrder;
            });

            return next;
        });
    }

    const purples = countPurples(board);
    const chargedClicks = countChargedClicks(board);
    const maxPurpleProb = Math.max(...analysis.purplePct.flat(), 0);
    const maxOrangeProb = Math.max(...analysis.cluePct.Orange.flat(), 0);
    const maxYellowProb = Math.max(...analysis.cluePct.Yellow.flat(), 0);
    const maxGreenProb = Math.max(...analysis.cluePct.Green.flat(), 0);
    const fourthPurpleId = purpleOrder.length >= TOTAL_PURPLES ? purpleOrder[TOTAL_PURPLES - 1] : null;

    return (
        <>
            <AppTitle>Mudae '$oq' Assistant</AppTitle>
            <Subtitle>
                Find <b>3 purple spheres</b>. The 4th purple turns red and counts as a click.
                <br />
                Blue=0, Teal=1, Green=2, Yellow=3, Orange=4 neighboring purples.
                <br />
                Clicks used: <b>{chargedClicks}</b> / {MAX_CLICKS}
            </Subtitle>

            <Panel className="mb-[10px] grid grid-cols-5 gap-2 p-[15px]">
                {Array.from({ length: 25 }, (_, i) => {
                    const r = Math.floor(i / N);
                    const c = i % N;
                    const state = board[r][c];

                    const purpleProb = state
                        ? state === "Purple"
                            ? 1
                            : 0
                        : analysis.purplePct[r][c];

                    const orangeProb = state ? 0 : analysis.cluePct.Orange[r][c];
                    const yellowProb = state ? 0 : analysis.cluePct.Yellow[r][c];
                    const greenProb = state ? 0 : analysis.cluePct.Green[r][c];

                    const stateIcon =
                        state === "Purple" && fourthPurpleId === i
                            ? ICONS.Red
                            : state
                                ? ICONS[state as IconKey]
                                : null;

                    const rows: Array<{
                        kind: "Purple" | "Red" | "Orange" | "Yellow" | "Green";
                        prob: number;
                        icon: string;
                        max: number;
                    }> = [];

                    if (!state && purpleProb > 0) {
                        rows.push({
                            kind: purples >= TOTAL_PURPLES - 1 ? "Red" : "Purple",
                            prob: purpleProb,
                            icon: purples >= TOTAL_PURPLES - 1 ? ICONS.Red : ICONS.Purple,
                            max: maxPurpleProb,
                        });
                    }

                    if (!state && showKakeraBoxes && orangeProb > 0) {
                        rows.push({
                            kind: "Orange",
                            prob: orangeProb,
                            icon: ICONS.Orange,
                            max: maxOrangeProb,
                        });
                    }

                    if (!state && showKakeraBoxes && yellowProb > 0) {
                        rows.push({
                            kind: "Yellow",
                            prob: yellowProb,
                            icon: ICONS.Yellow,
                            max: maxYellowProb,
                        });
                    }

                    if (!state && showKakeraBoxes && greenProb > 0) {
                        rows.push({
                            kind: "Green",
                            prob: greenProb,
                            icon: ICONS.Green,
                            max: maxGreenProb,
                        });
                    }

                    const displayMode = state ? "marked" : rows.length > 0 ? "live" : "empty";

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onCellClick(r, c)}
                            className={cn(
                                "flex h-16 w-16 select-none flex-col items-center justify-center overflow-hidden rounded-[10px] border p-[4px_5px] text-[#dbdee1] transition duration-100 hover:-translate-y-px",
                                displayMode === "marked" && "border-white/20 bg-[#565a65] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]",
                                displayMode === "live" && "border-white/10 bg-[#3a3d45] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]",
                                displayMode === "empty" && "border-white/[0.06] bg-[#2a2c32]",
                                chargedClicks >= MAX_CLICKS && !state && currentInk !== "None" && "cursor-not-allowed"
                            )}
                        >
                            {stateIcon ? (
                                <Icon src={stateIcon} className="h-[24px] w-[24px]" />
                            ) : (
                                <div className="flex w-full flex-col items-center gap-px text-[0.62rem] leading-[1.05]">
                                    {rows.map((row) => (
                                        <div key={row.kind} className="grid grid-cols-[12px_20px] items-center gap-x-1 whitespace-nowrap">
                                            <Icon src={row.icon} className="h-[9px] w-[9px]" />
                                            <span
                                                className="block w-5 text-right font-black tabular-nums"
                                                style={{ color: getOqTextColor(row.kind, row.prob, row.max) }}
                                            >
                                                {percentText(row.prob)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </Panel>

            <Palette
                inks={paletteInks}
                currentInk={currentInk}
                onSelect={setCurrentInk}
                onClear={() => {
                    setBoard(makeEmptyBoard());
                    setPurpleOrder([]);
                    setCurrentInk("None");
                }}
            />

            <Panel className="flex flex-col gap-2 p-[12px_15px]">
                <label className="flex items-center gap-2 text-sm text-[#dbdee1]">
                    <input
                        type="checkbox"
                        checked={showKakeraBoxes}
                        onChange={(e) => setShowKakeraBoxes(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <span className="inline-flex items-center gap-1">
                        Show
                        <Icon src={ICONS.Orange} className="h-4 w-4" />
                        <Icon src={ICONS.Yellow} className="h-4 w-4" />
                        <Icon src={ICONS.Green} className="h-4 w-4" />
                        %
                    </span>
                </label>
            </Panel>
        </>
    );
}

function OcSolver() {
    const CENTER = { r: 2, c: 2 };
    const ORANGE_COUNT = 2;
    const YELLOW_COUNT = 3;
    const GREEN_COUNT = 4;

    const paletteInks: PaletteInk[] = [
        { key: "None", icon: ICONS.Mystery },
        { key: "Blue", icon: ICONS.Blue },
        { key: "Teal", icon: ICONS.Teal },
        { key: "Green", icon: ICONS.Green },
        { key: "Yellow", icon: ICONS.Yellow },
        { key: "Orange", icon: ICONS.Orange },
        { key: "Red", icon: ICONS.Red },
        { key: "Clear" },
    ];

    const [board, setBoard] = useState<Board>(() => makeEmptyBoard());
    const [currentInk, setCurrentInk] = useState("None");
    const [showYellowOrangeBoxes, setShowYellowOrangeBoxes] = useState(false);
    //  const [showYellowBoxes, setShowYellowBoxes] = useState(false);
    const [showGreenBoxes, setShowGreenBoxes] = useState(false);

    const helpers = useMemo(() => {
        const isCenter = (r: number, c: number) => r === CENTER.r && c === CENTER.c;
        const inBounds = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;
        const getMark = (src: Board, r: number, c: number) => src[r][c];
        const getPlacedCount = (src: Board, color: string) => src.flat().filter((v) => v === color).length;
        const cellKey = (r: number, c: number) => `${r},${c}`;

        const getPlacedRedCell = (src: Board): [number, number] | null => {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (src[r][c] === "Red") return [r, c];
                }
            }
            return null;
        };

        const isOrthAdjacent = (r1: number, c1: number, r2: number, c2: number) => {
            const dr = Math.abs(r1 - r2);
            const dc = Math.abs(c1 - c2);
            return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
        };

        const isDiagonal = (r1: number, c1: number, r2: number, c2: number) => {
            const dr = Math.abs(r1 - r2);
            const dc = Math.abs(c1 - c2);
            return dr === dc && dr > 0;
        };

        const isLine = (r1: number, c1: number, r2: number, c2: number) => r1 === r2 || c1 === c2;

        const getOrthCells = (rr: number, rc: number) => {
            const out: Array<[number, number]> = [];
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

            for (const [dr, dc] of dirs) {
                const r = rr + dr;
                const c = rc + dc;
                if (inBounds(r, c)) out.push([r, c]);
            }

            return out;
        };

        const getDiagonalCells = (rr: number, rc: number) => {
            const out: Array<[number, number]> = [];

            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (r === rr && c === rc) continue;
                    if (isDiagonal(r, c, rr, rc)) out.push([r, c]);
                }
            }

            return out;
        };

        const getLineCells = (rr: number, rc: number) => {
            const out: Array<[number, number]> = [];

            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (r === rr && c === rc) continue;
                    if (isLine(r, c, rr, rc)) out.push([r, c]);
                }
            }

            return out;
        };

        const combinations = <T,>(arr: T[], k: number): T[][] => {
            const result: T[][] = [];
            const cur: T[] = [];

            const dfs = (start: number) => {
                if (cur.length === k) {
                    result.push([...cur]);
                    return;
                }

                for (let i = start; i < arr.length; i++) {
                    cur.push(arr[i]);
                    dfs(i + 1);
                    cur.pop();
                }
            };

            if (k === 0) return [[]];
            if (k < 0 || k > arr.length) return [];

            dfs(0);
            return result;
        };

        const cellsConflict = (a: Array<[number, number]>, b: Array<[number, number]>) => {
            const seen = new Set(a.map(([r, c]) => cellKey(r, c)));
            return b.some(([r, c]) => seen.has(cellKey(r, c)));
        };

        const isValidRed = (src: Board, rr: number, rc: number) => {
            if (isCenter(rr, rc)) return false;

            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const mark = src[r][c];
                    if (!mark) continue;

                    const line = isLine(r, c, rr, rc);
                    const diag = isDiagonal(r, c, rr, rc);
                    const orthAdj = isOrthAdjacent(r, c, rr, rc);

                    if (mark === "Teal" && !(line || diag)) return false;
                    if (mark === "Blue" && (line || diag)) return false;
                    if (mark === "Yellow" && !diag) return false;
                    if (mark === "Green" && !line) return false;
                    if (mark === "Orange" && !orthAdj) return false;
                    if (mark === "Red" && !(r === rr && c === rc)) return false;
                }
            }

            return true;
        };

        const getCandidateRedCells = (src: Board) => {
            const placedRed = getPlacedRedCell(src);

            if (placedRed) {
                const [rr, rc] = placedRed;
                return isValidRed(src, rr, rc) ? [[rr, rc] as [number, number]] : [];
            }

            const out: Array<[number, number]> = [];

            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (isCenter(r, c)) continue;
                    if (src[r][c] !== null) continue;
                    if (isValidRed(src, r, c)) out.push([r, c]);
                }
            }

            return out;
        };

        const buildColorOptionsForRed = (
            src: Board,
            rr: number,
            rc: number,
            color: "Orange" | "Yellow" | "Green",
            count: number,
            allowedCells: Array<[number, number]>,
            isAllowed: (r: number, c: number) => boolean
        ) => {
            const forced: Array<[number, number]> = [];
            const open: Array<[number, number]> = [];

            for (const [r, c] of allowedCells) {
                const mark = getMark(src, r, c);
                if (mark === color) forced.push([r, c]);
                else if (mark === null) open.push([r, c]);
            }

            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (getMark(src, r, c) !== color) continue;
                    if (!isAllowed(r, c)) return [];
                }
            }

            if (forced.length > count) return [];

            const need = count - forced.length;
            return combinations(open, need).map((extra) => [...forced, ...extra]);
        };

        const getJointDistributionsForRed = (src: Board, rr: number, rc: number) => {
            const orangeOptions = buildColorOptionsForRed(
                src,
                rr,
                rc,
                "Orange",
                ORANGE_COUNT,
                getOrthCells(rr, rc),
                (r, c) => isOrthAdjacent(r, c, rr, rc)
            );

            const yellowOptions = buildColorOptionsForRed(
                src,
                rr,
                rc,
                "Yellow",
                YELLOW_COUNT,
                getDiagonalCells(rr, rc),
                (r, c) => isDiagonal(r, c, rr, rc)
            );

            const greenOptions = buildColorOptionsForRed(
                src,
                rr,
                rc,
                "Green",
                GREEN_COUNT,
                getLineCells(rr, rc),
                (r, c) => isLine(r, c, rr, rc) && !(r === rr && c === rc)
            );

            const out: Array<{
                orange: Array<[number, number]>;
                yellow: Array<[number, number]>;
                green: Array<[number, number]>;
            }> = [];

            for (const orange of orangeOptions) {
                for (const yellow of yellowOptions) {
                    if (cellsConflict(orange, yellow)) continue;

                    for (const green of greenOptions) {
                        if (cellsConflict(orange, green)) continue;
                        if (cellsConflict(yellow, green)) continue;

                        out.push({ orange, yellow, green });
                    }
                }
            }

            return out;
        };

        const boardHasAnyConsistentSolution = (src: Board) => {
            const candidateReds = getCandidateRedCells(src);

            for (const [rr, rc] of candidateReds) {
                if (getJointDistributionsForRed(src, rr, rc).length > 0) return true;
            }

            return false;
        };

        const canPlaceMarkAt = (src: Board, r: number, c: number, value: CellMark) => {
            if (value === null) return true;
            if (isCenter(r, c) && value === "Red") return false;

            const current = src[r][c];
            if (current === value) return true;

            if (value === "Red") {
                const placedRed = getPlacedRedCell(src);
                if (placedRed && !(placedRed[0] === r && placedRed[1] === c)) return false;
            }

            const copy = src.map((row) => [...row]);
            copy[r][c] = value;

            return (
                getPlacedCount(copy, "Red") <= 1 &&
                getPlacedCount(copy, "Orange") <= ORANGE_COUNT &&
                getPlacedCount(copy, "Yellow") <= YELLOW_COUNT &&
                getPlacedCount(copy, "Green") <= GREEN_COUNT &&
                boardHasAnyConsistentSolution(copy)
            );
        };

        const analyzeBoard = (src: Board) => {
            const rawCandidateReds = getCandidateRedCells(src);

            const viable: Array<{
                red: [number, number];
                joints: Array<{
                    orange: Array<[number, number]>;
                    yellow: Array<[number, number]>;
                    green: Array<[number, number]>;
                }>;
            }> = [];

            for (const [rr, rc] of rawCandidateReds) {
                const joints = getJointDistributionsForRed(src, rr, rc);
                if (joints.length === 0) continue;

                viable.push({
                    red: [rr, rc],
                    joints,
                });
            }

            const candidateReds = viable.map((x) => x.red);
            const redPct = Array.from({ length: N }, () => Array(N).fill(0));
            const orangePct = Array.from({ length: N }, () => Array(N).fill(0));
            const yellowPct = Array.from({ length: N }, () => Array(N).fill(0));
            const greenPct = Array.from({ length: N }, () => Array(N).fill(0));

            if (viable.length === 0) {
                return { candidateReds, redPct, orangePct, yellowPct, greenPct };
            }

            const redWeight = 1 / viable.length;

            for (const item of viable) {
                const [rr, rc] = item.red;
                redPct[rr][rc] += redWeight;

                const jointWeight = redWeight / item.joints.length;

                for (const joint of item.joints) {
                    for (const [r, c] of joint.orange) {
                        orangePct[r][c] += jointWeight;
                    }

                    for (const [r, c] of joint.yellow) {
                        yellowPct[r][c] += jointWeight;
                    }

                    for (const [r, c] of joint.green) {
                        greenPct[r][c] += jointWeight;
                    }
                }
            }

            return { candidateReds, redPct, orangePct, yellowPct, greenPct };
        };

        return { isCenter, canPlaceMarkAt, analyzeBoard, getPlacedCount };
    }, []);

    const analysis = useMemo(() => helpers.analyzeBoard(board), [board, helpers]);

    const getActiveTier = () => {
        const redCount = helpers.getPlacedCount(board, "Red");
        const orangeCount = helpers.getPlacedCount(board, "Orange");
        const yellowCount = helpers.getPlacedCount(board, "Yellow");
        const greenCount = helpers.getPlacedCount(board, "Green");

        if (redCount === 0) return "Red";
        if (orangeCount < ORANGE_COUNT) return "Orange";
        if (yellowCount < YELLOW_COUNT) return "Yellow";
        if (greenCount < GREEN_COUNT) return "Green";
        return "Green";
    };

    const getMaxGridValue = (grid: number[][]) => Math.max(...grid.flat(), 0);

    const maxima = {
        redMax: getMaxGridValue(analysis.redPct),
        orangeMax: getMaxGridValue(analysis.orangePct),
        yellowMax: getMaxGridValue(analysis.yellowPct),
        greenMax: getMaxGridValue(analysis.greenPct),
    };

    const tier = getActiveTier();

    const getRowTextColor = (kind: "Red" | "Orange" | "Yellow" | "Green", value: number, maxValue: number) => {
        if (value <= 0 || maxValue <= 0) return "rgb(219, 222, 225)";

        const normalized = value / maxValue;
        const curved = Math.pow(normalized, 4);

        const paleMap = {
            Red: [235, 220, 220] as [number, number, number],
            Orange: [236, 226, 214] as [number, number, number],
            Yellow: [236, 235, 210] as [number, number, number],
            Green: [214, 236, 214] as [number, number, number],
        };

        const vividMap = {
            Red: [255, 70, 70] as [number, number, number],
            Orange: [255, 170, 55] as [number, number, number],
            Yellow: [255, 235, 40] as [number, number, number],
            Green: [85, 235, 85] as [number, number, number],
        };

        return mixColor(paleMap[kind], vividMap[kind], curved);
    };

    function setMark(r: number, c: number, value: CellMark) {
        setBoard((prev) => {
            if (!helpers.canPlaceMarkAt(prev, r, c, value)) return prev;

            const next = prev.map((row) => [...row]);
            next[r][c] = value;
            return next;
        });
    }

    return (
        <>
            <AppTitle>Mudae '$oc' Assistant</AppTitle>

            <Panel className="mb-[10px] grid grid-cols-5 gap-2 p-[15px]">
                {Array.from({ length: 25 }, (_, i) => {
                    const r = Math.floor(i / N);
                    const c = i % N;
                    const state = board[r][c];

                    const redProb = helpers.isCenter(r, c)
                        ? 0
                        : state === "Red"
                            ? 1
                            : state
                                ? 0
                                : analysis.redPct[r][c];

                    const orangeProb = state === "Orange"
                        ? 1
                        : state
                            ? 0
                            : analysis.orangePct[r][c];

                    const yellowProb = state === "Yellow"
                        ? 1
                        : state
                            ? 0
                            : analysis.yellowPct[r][c];

                    const greenProb = state === "Green"
                        ? 1
                        : state
                            ? 0
                            : analysis.greenPct[r][c];

                    const hasAnyChance =
                        redProb > 0 ||
                        (showYellowOrangeBoxes && orangeProb > 0) ||
                        // (showYellowBoxes && yellowProb > 0) ||
                        (showGreenBoxes && greenProb > 0);

                    const displayMode = state ? "marked" : hasAnyChance ? "live" : helpers.isCenter(r, c) ? "center" : "empty";

                    const allRows: Array<{
                        kind: "Red" | "Orange" | "Yellow" | "Green";
                        prob: number;
                        icon: string;
                        active: boolean;
                        max: number;
                    }> = [
                        {
                            kind: "Red",
                            prob: redProb,
                            icon: ICONS.Red,
                            active: tier === "Red",
                            max: Math.max(maxima.redMax, state === "Red" ? 1 : 0),
                        },
                        {
                            kind: "Orange",
                            prob: orangeProb,
                            icon: ICONS.Orange,
                            active: tier === "Orange",
                            max: Math.max(maxima.orangeMax, state === "Orange" ? 1 : 0),
                        },
                        {
                            kind: "Yellow",
                            prob: yellowProb,
                            icon: ICONS.Yellow,
                            active: tier === "Yellow",
                            max: Math.max(maxima.yellowMax, state === "Yellow" ? 1 : 0),
                        },
                        {
                            kind: "Green",
                            prob: greenProb,
                            icon: ICONS.Green,
                            active: tier === "Green",
                            max: Math.max(maxima.greenMax, state === "Green" ? 1 : 0),
                        },
                    ];

                    const rows = allRows.filter((row) => {
                        if (row.prob <= 0) return false;
                        if (row.kind === "Orange" && !showYellowOrangeBoxes) return false;
                        if (row.kind === "Yellow" && !showYellowOrangeBoxes) return false;
                        return !(row.kind === "Green" && !showGreenBoxes);

                    });

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setMark(r, c, currentInk === "None" ? null : (currentInk as CellMark))}
                            className={cn(
                                "flex h-16 w-16 select-none flex-col items-center justify-center overflow-hidden rounded-[10px] border p-[4px_5px] text-[#dbdee1] transition duration-100 hover:-translate-y-px",
                                displayMode === "center" && "border-white/5 bg-[#232428]",
                                displayMode === "marked" && "border-white/20 bg-[#565a65] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]",
                                displayMode === "live" && "border-white/10 bg-[#3a3d45] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]",
                                displayMode === "empty" && "border-white/[0.06] bg-[#2a2c32]"
                            )}
                        >
                            {state && <Icon src={ICONS[state as IconKey]} className="mb-[2px] h-[22px] w-[22px] shrink-0" />}

                            <div className="flex w-full flex-col items-center gap-px text-[0.62rem] leading-[1.05]">
                                {rows.map((row) => (
                                    <div key={row.kind} className={cn("grid grid-cols-[12px_20px] items-center gap-x-1 whitespace-nowrap", row.active && "font-black")}>
                                        <Icon src={row.icon} className="h-[9px] w-[9px]" />
                                        <span className="block w-5 text-right tabular-nums" style={{ color: getRowTextColor(row.kind, row.prob, row.max) }}>
                                            {percentText(row.prob)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </Panel>

            <Palette
                inks={paletteInks}
                currentInk={currentInk}
                onSelect={setCurrentInk}
                onClear={() => {
                    setBoard(makeEmptyBoard());
                    setCurrentInk("None");
                }}
            />

            <Panel className="flex flex-col gap-2 p-[12px_15px]">
                <label className="flex items-center gap-2 text-sm text-[#dbdee1]">
                    <input
                        type="checkbox"
                        checked={showYellowOrangeBoxes}
                        onChange={(e) => setShowYellowOrangeBoxes(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <span className="inline-flex items-center gap-1">
                        Show
                        <Icon src={ICONS.Orange} className="h-4 w-4" />
                        <Icon src={ICONS.Yellow} className="h-4 w-4" />
                        %
                    </span>
                </label>

                <label className="flex items-center gap-2 text-sm text-[#dbdee1]">
                    <input
                        type="checkbox"
                        checked={showGreenBoxes}
                        onChange={(e) => setShowGreenBoxes(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <span className="inline-flex items-center gap-1">
                        Show
                        <Icon src={ICONS.Green} className="h-4 w-4"/>
                        %
                    </span>
                </label>
            </Panel>
        </>
    );
}

function OtSolver() {
    const COLOR_ORDER = ["Blue", "Teal", "Green", "Yellow", "Orange", "Black"] as const;
    const paletteInks: PaletteInk[] = [
        {key: "None", icon: ICONS.Mystery},
        {key: "Blue", icon: ICONS.Blue},
        {key: "Teal", icon: ICONS.Teal },
        { key: "Green", icon: ICONS.Green },
        { key: "Yellow", icon: ICONS.Yellow },
        { key: "Orange", icon: ICONS.Orange },
        { key: "Black", icon: ICONS.Black },
        { key: "Clear" },
    ];

    const [board, setBoard] = useState<Board>(() => makeEmptyBoard());
    const [currentInk, setCurrentInk] = useState("None");

    const segmentMap = useMemo(() => {
        function cellId(r: number, c: number) {
            return r * N + c;
        }
        function buildSegmentsOfLength(len: number) {
            const segments: number[][] = [];
            for (let r = 0; r < N; r++) {
                for (let c = 0; c + len - 1 < N; c++) {
                    const cells: number[] = [];
                    for (let k = 0; k < len; k++) cells.push(cellId(r, c + k));
                    segments.push(cells);
                }
            }
            for (let c = 0; c < N; c++) {
                for (let r = 0; r + len - 1 < N; r++) {
                    const cells: number[] = [];
                    for (let k = 0; k < len; k++) cells.push(cellId(r + k, c));
                    segments.push(cells);
                }
            }
            return segments;
        }
        return {
            Teal: buildSegmentsOfLength(4),
            Green: buildSegmentsOfLength(3),
            Yellow: buildSegmentsOfLength(3),
            Orange: buildSegmentsOfLength(2),
            Black: buildSegmentsOfLength(2),
        };
    }, []);

    const analysis = useMemo(() => {
        const cellId = (r: number, c: number) => r * N + c;
        const rcFromId = (id: number): [number, number] => [Math.floor(id / N), id % N];
        const matchesClues = (boardColors: string[]) => {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const placed = board[r][c];
                    if (!placed) continue;
                    if (boardColors[cellId(r, c)] !== placed) return false;
                }
            }
            return true;
        };

        const totalCounts: Record<string, number[]> = {
            Blue: Array(25).fill(0),
            Teal: Array(25).fill(0),
            Green: Array(25).fill(0),
            Yellow: Array(25).fill(0),
            Orange: Array(25).fill(0),
            Black: Array(25).fill(0),
        };

        let total = 0;

        for (const teal of segmentMap.Teal) {
            const tealSet = new Set(teal);
            for (const green of segmentMap.Green) {
                if (green.some((id) => tealSet.has(id))) continue;
                const tgSet = new Set([...teal, ...green]);
                for (const yellow of segmentMap.Yellow) {
                    if (yellow.some((id) => tgSet.has(id))) continue;
                    const tgySet = new Set([...teal, ...green, ...yellow]);
                    for (const orange of segmentMap.Orange) {
                        if (orange.some((id) => tgySet.has(id))) continue;
                        const tgyoSet = new Set([...teal, ...green, ...yellow, ...orange]);
                        for (const black of segmentMap.Black) {
                            if (black.some((id) => tgyoSet.has(id))) continue;
                            const boardColors = Array(25).fill("Blue");
                            teal.forEach((id) => (boardColors[id] = "Teal"));
                            green.forEach((id) => (boardColors[id] = "Green"));
                            yellow.forEach((id) => (boardColors[id] = "Yellow"));
                            orange.forEach((id) => (boardColors[id] = "Orange"));
                            black.forEach((id) => (boardColors[id] = "Black"));
                            if (!matchesClues(boardColors)) continue;
                            total++;
                            for (let id = 0; id < 25; id++) totalCounts[boardColors[id]][id]++;
                        }
                    }
                }
            }
        }

        const pct: Record<string, number[][]> = {
            Blue: Array.from({ length: N }, () => Array(N).fill(0)),
            Teal: Array.from({ length: N }, () => Array(N).fill(0)),
            Green: Array.from({ length: N }, () => Array(N).fill(0)),
            Yellow: Array.from({ length: N }, () => Array(N).fill(0)),
            Orange: Array.from({ length: N }, () => Array(N).fill(0)),
            Black: Array.from({ length: N }, () => Array(N).fill(0)),
        };

        if (total > 0) {
            for (const color of COLOR_ORDER) {
                for (let id = 0; id < 25; id++) {
                    const [r, c] = rcFromId(id);
                    pct[color][r][c] = totalCounts[color][id] / total;
                }
            }
        }

        return { total, pct };
    }, [board, segmentMap]);

    const getMaxGridValue = (grid: number[][]) => Math.max(...grid.flat(), 0);
    const maxima = Object.fromEntries(COLOR_ORDER.map((color) => [color, getMaxGridValue(analysis.pct[color])])) as Record<(typeof COLOR_ORDER)[number], number>;

    const getRowTextColor = (kind: (typeof COLOR_ORDER)[number], value: number, maxValue: number) => {
        if (value <= 0 || maxValue <= 0) return "rgb(219, 222, 225)";
        const normalized = value / maxValue;
        const curved = Math.pow(normalized, 2.2);
        const paleMap = {
            Blue: [220, 226, 236] as [number, number, number],
            Teal: [210, 236, 236] as [number, number, number],
            Green: [214, 236, 214] as [number, number, number],
            Yellow: [236, 235, 210] as [number, number, number],
            Orange: [236, 226, 214] as [number, number, number],
            Black: [225, 225, 225] as [number, number, number],
        };
        const vividMap = {
            Blue: [110, 155, 255] as [number, number, number],
            Teal: [72, 225, 225] as [number, number, number],
            Green: [85, 235, 85] as [number, number, number],
            Yellow: [255, 235, 40] as [number, number, number],
            Orange: [255, 170, 55] as [number, number, number],
            Black: [245, 245, 245] as [number, number, number],
        };
        return mixColor(paleMap[kind], vividMap[kind], curved);
    };

    function canPlaceMarkAt(r: number, c: number, value: CellMark) {
        if (value === null) return true;
        const copy = board.map((row) => [...row]);
        copy[r][c] = value;
        const counts = {
            Teal: copy.flat().filter((v) => v === "Teal").length,
            Green: copy.flat().filter((v) => v === "Green").length,
            Yellow: copy.flat().filter((v) => v === "Yellow").length,
            Orange: copy.flat().filter((v) => v === "Orange").length,
            Black: copy.flat().filter((v) => v === "Black").length,
            Blue: copy.flat().filter((v) => v === "Blue").length,
        };
        if (counts.Teal > 4 || counts.Green > 3 || counts.Yellow > 3 || counts.Orange > 2 || counts.Black > 2 || counts.Blue > 11) return false;

        const matchesClues = (boardColors: string[]) => {
            for (let rr = 0; rr < N; rr++) {
                for (let cc = 0; cc < N; cc++) {
                    const placed = copy[rr][cc];
                    if (!placed) continue;
                    if (boardColors[rr * N + cc] !== placed) return false;
                }
            }
            return true;
        };

        for (const teal of segmentMap.Teal) {
            const tealSet = new Set(teal);
            for (const green of segmentMap.Green) {
                if (green.some((id) => tealSet.has(id))) continue;
                const tgSet = new Set([...teal, ...green]);
                for (const yellow of segmentMap.Yellow) {
                    if (yellow.some((id) => tgSet.has(id))) continue;
                    const tgySet = new Set([...teal, ...green, ...yellow]);
                    for (const orange of segmentMap.Orange) {
                        if (orange.some((id) => tgySet.has(id))) continue;
                        const tgyoSet = new Set([...teal, ...green, ...yellow, ...orange]);
                        for (const black of segmentMap.Black) {
                            if (black.some((id) => tgyoSet.has(id))) continue;
                            const boardColors = Array(25).fill("Blue");
                            teal.forEach((id) => (boardColors[id] = "Teal"));
                            green.forEach((id) => (boardColors[id] = "Green"));
                            yellow.forEach((id) => (boardColors[id] = "Yellow"));
                            orange.forEach((id) => (boardColors[id] = "Orange"));
                            black.forEach((id) => (boardColors[id] = "Black"));
                            if (matchesClues(boardColors)) return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    function setMark(r: number, c: number, value: CellMark) {
        setBoard((prev) => {
            if (!canPlaceMarkAt(r, c, value)) return prev;
            const next = prev.map((row) => [...row]);
            next[r][c] = value;
            return next;
        });
    }

    return (
        <>
            <AppTitle>Mudae '$ot' Assistant</AppTitle>
            <Subtitle>
                Blue=11, Teal=4, Green=3, Yellow=3, Orange=2 Black=2.
            </Subtitle>

            <Panel className="mb-[18px] grid grid-cols-5 gap-2 p-[15px]">
                {Array.from({ length: 25 }, (_, i) => {
                    const r = Math.floor(i / N);
                    const c = i % N;
                    const state = board[r][c];
                    const rows = COLOR_ORDER.map((color) => {
                        let prob = analysis.pct[color][r][c];
                        if (state) prob = state === color ? 1 : 0;
                        return {
                            color,
                            prob,
                            max: Math.max(maxima[color], state === color ? 1 : 0),
                            icon: ICONS[color],
                        };
                    }).filter((row) => row.prob > 0);
                    const hasAnyChance = COLOR_ORDER.some((color) => analysis.pct[color][r][c] > 0);
                    const displayMode = state ? "marked" : hasAnyChance ? "live" : "empty";

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setMark(r, c, currentInk === "None" ? null : (currentInk as CellMark))}
                            className={cn(
                                "flex h-[76px] w-[76px] select-none flex-col items-center justify-center overflow-hidden rounded-[10px] border p-[4px_5px] text-[#dbdee1] transition duration-100 hover:-translate-y-px",
                                displayMode === "marked" && "border-white/20 bg-[#565a65] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]",
                                displayMode === "live" && "border-white/10 bg-[#3a3d45] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]",
                                displayMode === "empty" && "border-white/[0.06] bg-[#2a2c32]"
                            )}
                        >
                            {state && <Icon src={ICONS[state as IconKey]} className="mb-[3px] h-[22px] w-[22px] shrink-0" />}
                            <div className="flex w-full flex-col items-center gap-px text-[0.62rem] leading-[1.05]">
                                {rows.map((row) => (
                                    <div key={row.color} className="grid grid-cols-[12px_24px] items-center gap-x-1 whitespace-nowrap">
                                        <Icon src={row.icon} className="h-[9px] w-[9px]" />
                                        <span className="block w-6 text-right tabular-nums" style={{ color: getRowTextColor(row.color, row.prob, row.max) }}>
                      {percentText(row.prob)}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </Panel>

            <Palette
                inks={paletteInks}
                currentInk={currentInk}
                onSelect={setCurrentInk}
                onClear={() => {
                    setBoard(makeEmptyBoard());
                    setCurrentInk("None");
                }}
            />

            <Panel className="min-w-[320px] rounded-[10px] px-3 py-[10px] text-center text-[0.84rem]">
                {analysis.total === 0 ? (
                    <span className="font-bold text-[#ff8d8d]">No valid boards match the current clues.</span>
                ) : (
                    <span className="text-[#a6f3a6]">
            <span className="font-bold">{analysis.total}</span> valid board{analysis.total === 1 ? "" : "s"} remaining.
          </span>
                )}
            </Panel>
        </>
    );
}

function OcScoreSolver() {
    type OcPolicyColor = "Blue" | "Teal" | "Green" | "Yellow" | "Orange" | "Red";
    type BoardRotation = 0 | 90 | 180 | 270;

    type OcPolicy = {
        maxGuesses: number;
        colorCount: number;
        entryCount: number;
        fileScoreValues: number[];
        entries: Uint32Array<ArrayBuffer>;
    };

    const OC_SCORE_POLICY_URL = "/oc_score_policy.bin";
    const OC_ROTATION_STORAGE_KEY = "oc_score_board_rotation";

    const BASE_SCORE_VALUES: Record<OcPolicyColor, number> = {
        Blue: 10,
        Teal: 20,
        Green: 35,
        Yellow: 55,
        Orange: 90,
        Red: 150,
    };

    const OC_POLICY_COLORS: OcPolicyColor[] = [
        "Blue",
        "Teal",
        "Green",
        "Yellow",
        "Orange",
        "Red",
    ];

    const OC_POLICY_COLOR_INDEX: Record<OcPolicyColor, number> = {
        Blue: 0,
        Teal: 1,
        Green: 2,
        Yellow: 3,
        Orange: 4,
        Red: 5,
    };

    const ROTATION_OPTIONS: Array<{ value: BoardRotation; label: string }> = [
        { value: 0, label: "0°" },
        { value: 90, label: "90°" },
        { value: 180, label: "180°" },
        { value: 270, label: "270°" },
    ];

    function getInitialBoardRotation(): BoardRotation {
        try {
            const raw = window.localStorage.getItem(OC_ROTATION_STORAGE_KEY);

            if (raw === "90") return 90;
            if (raw === "180") return 180;
            if (raw === "270") return 270;
        } catch {
            return 0;
        }

        return 0;
    }

    function saveBoardRotation(rotation: BoardRotation) {
        try {
            window.localStorage.setItem(OC_ROTATION_STORAGE_KEY, String(rotation));
        } catch {
            // Ignore storage failures.
        }
    }

    function getAdjustedScore(color: OcPolicyColor, addition: number, multiplier: number) {
        return (BASE_SCORE_VALUES[color] + addition) * multiplier;
    }

    function rotateCellId(id: number | null, rotation: BoardRotation) {
        if (id === null) return null;

        const r = Math.floor(id / N);
        const c = id % N;

        let rr = r;
        let cc = c;

        if (rotation === 90) {
            rr = c;
            cc = N - 1 - r;
        } else if (rotation === 180) {
            rr = N - 1 - r;
            cc = N - 1 - c;
        } else if (rotation === 270) {
            rr = N - 1 - c;
            cc = r;
        }

        return rr * N + cc;
    }

    function ocPolicyOffsetForDepth(depth: number) {
        let offset = 0;
        let pow6 = 1;

        for (let i = 0; i < depth; i++) {
            offset += pow6;
            pow6 *= 6;
        }

        return offset;
    }

    function ocHistoryCode(history: number[]) {
        let code = 0;

        for (const color of history) {
            code = code * 6 + color;
        }

        return code;
    }

    function decodeOcPolicyEntry(packed: number) {
        const cellRaw = packed & 31;
        const possibleMask = (packed >>> 5) & 63;
        const ev = (packed >>> 11) / 1000;

        return {
            cell: cellRaw === 31 ? null : cellRaw,
            possibleMask,
            ev,
        };
    }

    function getOcPolicyEntry(policy: OcPolicy, history: number[]) {
        const depth = history.length;

        if (depth >= policy.maxGuesses) {
            return {
                cell: null,
                possibleMask: 0,
                ev: 0,
            };
        }

        const index = ocPolicyOffsetForDepth(depth) + ocHistoryCode(history);
        return decodeOcPolicyEntry(policy.entries[index] ?? 0);
    }

    function getAdjustedRemainingEv(
        policy: OcPolicy,
        entry: { ev: number },
        historyLength: number,
        addition: number,
        multiplier: number
    ) {
        const guessesLeft = Math.max(0, policy.maxGuesses - historyLength);
        return (entry.ev + addition * guessesLeft) * multiplier;
    }

    function ocCellLabel(id: number | null) {
        if (id === null) return "None";
        return `R${Math.floor(id / N) + 1}C${(id % N) + 1}`;
    }

    async function loadOcPolicy(): Promise<OcPolicy> {
        const response = await fetch(OC_SCORE_POLICY_URL, {
            cache: "force-cache",
        });

        if (!response.ok) {
            throw new Error(`Failed to load ${OC_SCORE_POLICY_URL}: HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const view = new DataView(buffer);

        const magic = String.fromCharCode(
            view.getUint8(0),
            view.getUint8(1),
            view.getUint8(2),
            view.getUint8(3)
        );

        if (magic !== "OCSP") {
            throw new Error("Invalid oc_score_policy.bin file. Expected OCSP header.");
        }

        let offset = 4;

        const version = view.getUint32(offset, true);
        offset += 4;

        if (version !== 1) {
            throw new Error(`Unsupported OC score policy version: ${version}`);
        }

        const maxGuesses = view.getUint32(offset, true);
        offset += 4;

        const colorCount = view.getUint32(offset, true);
        offset += 4;

        const entryCount = view.getUint32(offset, true);
        offset += 4;

        if (colorCount !== 6) {
            throw new Error(`Invalid color count in policy file: ${colorCount}`);
        }

        const fileScoreValues: number[] = [];

        for (let i = 0; i < colorCount; i++) {
            fileScoreValues.push(view.getUint32(offset, true));
            offset += 4;
        }

        const entries = new Uint32Array(entryCount);

        for (let i = 0; i < entryCount; i++) {
            entries[i] = view.getUint32(offset, true);
            offset += 4;
        }

        return {
            maxGuesses,
            colorCount,
            entryCount,
            fileScoreValues,
            entries,
        };
    }

    const [policy, setPolicy] = useState<OcPolicy | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scoreAddition, setScoreAddition] = useState(0);
    const [scoreMultiplier, setScoreMultiplier] = useState(1);
    const [boardRotation, setBoardRotation] = useState<BoardRotation>(() => getInitialBoardRotation());
    const [history, setHistory] = useState<number[]>([]);
    const [reveals, setReveals] = useState<Array<{ cell: number; color: OcPolicyColor }>>([]);

    useEffect(() => {
        let cancelled = false;

        loadOcPolicy()
            .then((loadedPolicy) => {
                if (!cancelled) {
                    setPolicy(loadedPolicy);
                    setError(null);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setError(String(e));
                    setPolicy(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const entry = policy ? getOcPolicyEntry(policy, history) : null;
    const bestCell = entry?.cell ?? null;
    const displayBestCell = rotateCellId(bestCell, boardRotation);

    const startEntry = policy ? getOcPolicyEntry(policy, []) : null;
    const displayStartCell = rotateCellId(startEntry?.cell ?? null, boardRotation);

    const revealByCell = new Map<number, OcPolicyColor>();

    for (const reveal of reveals) {
        const displayCell = rotateCellId(reveal.cell, boardRotation);

        if (displayCell !== null) {
            revealByCell.set(displayCell, reveal.color);
        }
    }

    const currentScore = reveals.reduce((sum, reveal) => {
        return sum + getAdjustedScore(reveal.color, scoreAddition, scoreMultiplier);
    }, 0);

    const adjustedRemainingEv = policy && entry
        ? getAdjustedRemainingEv(policy, entry, history.length, scoreAddition, scoreMultiplier)
        : 0;

    const expectedFinalScore = currentScore + adjustedRemainingEv;

    const branchRows = policy && entry
        ? OC_POLICY_COLORS
            .map((color, index) => {
                if ((entry.possibleMask & (1 << index)) === 0) {
                    return null;
                }

                const nextHistory = [...history, index];
                const nextEntry = getOcPolicyEntry(policy, nextHistory);
                const score = getAdjustedScore(color, scoreAddition, scoreMultiplier);
                const futureEv = getAdjustedRemainingEv(policy, nextEntry, nextHistory.length, scoreAddition, scoreMultiplier);

                return {
                    color,
                    index,
                    score,
                    nextCell: nextEntry.cell,
                    futureEv,
                    totalAfter: score + futureEv,
                };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null)
        : [];

    function setPermanentBoardRotation(rotation: BoardRotation) {
        if (history.length > 0) {
            return;
        }

        setBoardRotation(rotation);
        saveBoardRotation(rotation);
    }

    function revealColor(color: OcPolicyColor) {
        if (!policy || !entry || bestCell === null) {
            return;
        }

        if (history.length >= policy.maxGuesses) {
            return;
        }

        const colorIndex = OC_POLICY_COLOR_INDEX[color];

        if ((entry.possibleMask & (1 << colorIndex)) === 0) {
            return;
        }

        setHistory((old) => [...old, colorIndex]);
        setReveals((old) => [...old, { cell: bestCell, color }]);
    }

    function undoLast() {
        setHistory((old) => old.slice(0, -1));
        setReveals((old) => old.slice(0, -1));
    }

    function reset() {
        setHistory([]);
        setReveals([]);
    }

    const revealPalette: PaletteInk[] = [
        { key: "Blue", icon: ICONS.Blue },
        { key: "Teal", icon: ICONS.Teal },
        { key: "Green", icon: ICONS.Green },
        { key: "Yellow", icon: ICONS.Yellow },
        { key: "Orange", icon: ICONS.Orange },
        { key: "Red", icon: ICONS.Red },
        { key: "Clear" },
    ];

    const rotationLocked = history.length > 0;

    return (
        <>
            <AppTitle>Mudae '$oc' EV Assistant</AppTitle>

            {error && (
                <Panel className="mb-3 max-w-[520px] p-3 text-sm font-bold text-[#ff8d8d]">
                    {error}
                </Panel>
            )}

            {!policy && !error && (
                <Panel className="mb-3 max-w-[520px] p-3 text-sm">
                    Loading <b>oc_score_policy.bin</b>...
                </Panel>
            )}

            {policy && (
                <>
                    <Panel className="mb-[10px] grid grid-cols-5 gap-2 p-[15px]">
                        {Array.from({ length: 25 }, (_, i) => {
                            const revealedColor = revealByCell.get(i);
                            const isBest = displayBestCell === i;
                            const isDone = history.length >= policy.maxGuesses;
                            const displayMode = revealedColor
                                ? "marked"
                                : isBest && !isDone
                                    ? "live"
                                    : i === 12
                                        ? "center"
                                        : "empty";

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    className={cn(
                                        "flex h-16 w-16 select-none flex-col items-center justify-center overflow-hidden rounded-[10px] border p-[4px_5px] text-[#dbdee1] transition duration-100",
                                        displayMode === "center" && "border-white/5 bg-[#232428]",
                                        displayMode === "marked" && "border-white/20 bg-[#565a65] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]",
                                        displayMode === "live" && "border-[#ff7474]/80 bg-[#4a3337] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_0_12px_rgba(255,80,80,0.28)]",
                                        displayMode === "empty" && "border-white/[0.06] bg-[#2a2c32]"
                                    )}
                                >
                                    {revealedColor ? (
                                        <>
                                            <Icon src={ICONS[revealedColor]} className="mb-[2px] h-[22px] w-[22px] shrink-0" />
                                            <div className="text-[0.60rem] font-black leading-none tabular-nums text-white/85">
                                                +{getAdjustedScore(revealedColor, scoreAddition, scoreMultiplier)}
                                            </div>
                                        </>
                                    ) : isBest && !isDone ? (
                                        <div className="flex w-full flex-col items-center justify-center gap-[2px] text-[0.62rem] leading-[1.05]">
                                            <Icon src={ICONS.Mystery} className="h-[15px] w-[15px]" />
                                            <span className="font-black text-[#ffb3b3]">NEXT</span>
                                            <span className="font-bold tabular-nums text-white/70">{ocCellLabel(i)}</span>
                                        </div>
                                    ) : (
                                        <div className="text-[0.58rem] font-bold text-white/20">
                                            {i === 12 ? "CENTER" : ""}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </Panel>

                    <Panel className="mb-[10px] grid grid-cols-4 gap-[10px] p-[14px]">
                        {revealPalette.map((ink) => {
                            if (ink.key === "Clear") {
                                return (
                                    <React.Fragment key={ink.key}>
                                        <PaletteButton
                                            clear
                                            label="Reset"
                                            onClick={reset}
                                        />
                                    </React.Fragment>
                                );
                            }

                            const color = ink.key as OcPolicyColor;
                            const colorIndex = OC_POLICY_COLOR_INDEX[color];
                            const allowed = !!entry && bestCell !== null && (entry.possibleMask & (1 << colorIndex)) !== 0;

                            return (
                                <button
                                    key={ink.key}
                                    type="button"
                                    disabled={!allowed}
                                    onClick={() => revealColor(color)}
                                    className={cn(
                                        "flex h-11 w-14 items-center justify-center rounded-[10px] border-2 transition duration-100",
                                        allowed
                                            ? "border-white/10 bg-white/5 hover:-translate-y-px hover:opacity-90"
                                            : "cursor-not-allowed border-white/[0.04] bg-black/10 opacity-25"
                                    )}
                                >
                                    <Icon src={ink.icon!} className="h-[26px] w-[26px]" />
                                </button>
                            );
                        })}
                    </Panel>

                    <Panel className="mb-[10px] flex flex-col gap-2 p-[12px_15px] text-sm text-[#dbdee1]">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="font-bold text-white/80">Addition</span>

                            <button
                                type="button"
                                onClick={() => setScoreAddition((old) => Math.max(0, old - 2))}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-bold hover:bg-white/10"
                            >
                                -2
                            </button>

                            <input
                                type="number"
                                min={0}
                                max={999}
                                step={1}
                                value={scoreAddition}
                                onChange={(e) => {
                                    const next = Number(e.target.value);
                                    setScoreAddition(Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0);
                                }}
                                className="w-16 rounded-lg border border-white/10 bg-[#1e1f22] px-2 py-1 text-center font-bold text-white outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setScoreAddition((old) => old + 2)}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-bold hover:bg-white/10"
                            >
                                +2
                            </button>

                            <button
                                type="button"
                                onClick={() => setScoreMultiplier(1)}
                                className={cn(
                                    "rounded-lg border px-3 py-1 font-bold hover:bg-white/10",
                                    scoreMultiplier === 1
                                        ? "border-white/70 bg-white/15 text-white"
                                        : "border-white/10 bg-white/5 text-white/70"
                                )}
                            >
                                x1
                            </button>

                            <button
                                type="button"
                                onClick={() => setScoreMultiplier(2)}
                                className={cn(
                                    "rounded-lg border px-3 py-1 font-bold hover:bg-white/10",
                                    scoreMultiplier === 2
                                        ? "border-white/70 bg-white/15 text-white"
                                        : "border-white/10 bg-white/5 text-white/70"
                                )}
                            >
                                x2
                            </button>

                            <button
                                type="button"
                                onClick={undoLast}
                                disabled={history.length === 0}
                                className={cn(
                                    "rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-bold hover:bg-white/10",
                                    history.length === 0 && "cursor-not-allowed opacity-40"
                                )}
                            >
                                Undo
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-2">
                            <span className="font-bold text-white/80">Board rotation</span>

                            {ROTATION_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={rotationLocked}
                                    onClick={() => setPermanentBoardRotation(option.value)}
                                    className={cn(
                                        "rounded-lg border px-3 py-1 font-bold hover:bg-white/10",
                                        boardRotation === option.value
                                            ? "border-white/70 bg-white/15 text-white"
                                            : "border-white/10 bg-white/5 text-white/70",
                                        rotationLocked && "cursor-not-allowed opacity-45"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}

                            <span className="text-xs text-white/45">
                                Start: {ocCellLabel(displayStartCell)}
                                {rotationLocked ? " locked" : ""}
                            </span>
                        </div>
                    </Panel>

                    <Panel className="mb-[10px] w-full max-w-[520px] p-3 text-xs">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div>Guesses used</div>
                            <div className="text-right font-bold tabular-nums">{history.length} / {policy.maxGuesses}</div>

                            <div>Current score</div>
                            <div className="text-right font-bold tabular-nums">{currentScore}</div>

                            <div>Addition</div>
                            <div className="text-right font-bold tabular-nums">+{scoreAddition}</div>

                            <div>Multiplier</div>
                            <div className="text-right font-bold tabular-nums">x{scoreMultiplier}</div>

                            <div>Board rotation</div>
                            <div className="text-right font-bold tabular-nums">{boardRotation}°</div>

                            <div>Starting click</div>
                            <div className="text-right font-bold">{ocCellLabel(displayStartCell)}</div>

                            <div>Best next click</div>
                            <div className="text-right font-bold">{ocCellLabel(displayBestCell)}</div>

                            <div>Expected remaining</div>
                            <div className="text-right font-bold tabular-nums">{adjustedRemainingEv.toFixed(1)}</div>

                            <div>Expected final</div>
                            <div className="text-right font-bold tabular-nums">{expectedFinalScore.toFixed(1)}</div>

                            <div>Policy entries</div>
                            <div className="text-right font-bold tabular-nums">{policy.entryCount}</div>
                        </div>
                    </Panel>

                    <Panel className="mb-[10px] w-full max-w-[520px] p-3 text-xs">
                        <div className="mb-2 font-bold">Score values</div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
                            {OC_POLICY_COLORS.map((color) => (
                                <div key={color} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1">
                                    <span className="flex items-center gap-1 font-bold">
                                        <Icon src={ICONS[color]} className="h-4 w-4" />
                                        {color}
                                    </span>
                                    <span className="font-bold tabular-nums">
                                        {getAdjustedScore(color, scoreAddition, scoreMultiplier)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    {branchRows.length > 0 && (
                        <Panel className="w-full max-w-[520px] overflow-hidden p-3 text-xs">
                            <div className="mb-2 font-bold">
                                If {ocCellLabel(displayBestCell)} reveals...
                            </div>

                            <table className="w-full border-collapse">
                                <thead className="text-white/60">
                                <tr>
                                    <th className="pb-1 text-left">Color</th>
                                    <th className="pb-1 text-right">Score</th>
                                    <th className="pb-1 text-right">Next</th>
                                    <th className="pb-1 text-right">Future EV</th>
                                    <th className="pb-1 text-right">Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {branchRows.map((row) => {
                                    const displayNextCell = rotateCellId(row.nextCell, boardRotation);

                                    return (
                                        <tr key={row.color}>
                                            <td className="flex items-center gap-1 py-[2px] font-bold">
                                                <Icon src={ICONS[row.color]} className="h-4 w-4" />
                                                {row.color}
                                            </td>
                                            <td className="py-[2px] text-right tabular-nums">+{row.score}</td>
                                            <td className="py-[2px] text-right font-bold">{ocCellLabel(displayNextCell)}</td>
                                            <td className="py-[2px] text-right tabular-nums">{row.futureEv.toFixed(1)}</td>
                                            <td className="py-[2px] text-right font-bold tabular-nums">{row.totalAfter.toFixed(1)}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </Panel>
                    )}
                </>
            )}
        </>
    );
}

function OqScoreSolver() {
    type OqPolicyColor = "Blue" | "Teal" | "Green" | "Yellow" | "Orange" | "Purple" | "Red";

    type OqNode = {
        bestCell: number | null;
        ev: number;
        chargedLeft: number;
        clickedMask: number;
        foundPurpleMask: number;
        redCell: number | null;
        edgeStart: number;
        edgeCount: number;
        aliveCount: number;
    };

    type OqEdge = {
        outcomeCode: number;
        childNode: number;
        probability: number;
        reward: number;
        boardCount: number;
    };

    type OqPolicy = {
        n: number;
        cells: number;
        purpleCount: number;
        freePurplesToFind: number;
        maxChargedClicks: number;
        scoreValueCount: number;
        rootNodeIndex: number;
        nodeCount: number;
        edgeCount: number;
        fileScoreValues: number[];
        nodes: OqNode[];
        edges: OqEdge[];
    };

    type ManualReveal = {
        cell: number;
        outcomeCode: number;
        score: number;
        label: string;
        icon: IconKey;
        revealedRedCell?: number;
    };

    type PendingManualRedReveal = {
        purpleCell: number;
        edges: OqEdge[];
    };

    type AutoSuggestion = {
        cell: number;
        outcomeCode: number;
        icon: IconKey;
        score: number;
        label: string;
        rank: number;
    };

    type RandomGame = {
        purpleMask: number;
        clickedMask: number;
        foundPurpleMask: number;
        redCell: number | null;
        nodeIndex: number;
        reveals: ManualReveal[];
        score: number;
        chargedUsed: number;
        offPolicy: boolean;
        done: boolean;
        error: string | null;
    };

    const OQ_SCORE_POLICY_URL = "/oq_score_policy.bin";

    const BASE_SCORE_VALUES: Record<Exclude<OqPolicyColor, "Purple">, number> = {
        Blue: 10,
        Teal: 20,
        Green: 35,
        Yellow: 55,
        Orange: 90,
        Red: 150,
    };

    const OQ_CLUE_COLORS: Array<Exclude<OqPolicyColor, "Purple" | "Red">> = [
        "Blue",
        "Teal",
        "Green",
        "Yellow",
        "Orange",
    ];

    function bitOfCell(id: number) {
        return 1 << id;
    }

    function hasBit(mask: number, id: number) {
        return (mask & bitOfCell(id)) !== 0;
    }

    function popcount(mask: number) {
        let x = mask >>> 0;
        let count = 0;

        while (x !== 0) {
            count += x & 1;
            x >>>= 1;
        }

        return count;
    }

    function cellLabel(id: number | null) {
        if (id === null) return "None";
        return `R${Math.floor(id / N) + 1}C${(id % N) + 1}`;
    }

    function getAdjustedScore(color: Exclude<OqPolicyColor, "Purple">, addition: number, multiplier: number) {
        return (BASE_SCORE_VALUES[color] + addition) * multiplier;
    }

    function getNeighborCountFromMask(purpleMask: number, cell: number) {
        const r = Math.floor(cell / N);
        const c = cell % N;
        let count = 0;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const rr = r + dr;
                const cc = c + dc;

                if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue;

                const id = rr * N + cc;

                if (hasBit(purpleMask, id)) {
                    count++;
                }
            }
        }

        return Math.min(count, 4);
    }

    function getHiddenCellIcon(purpleMask: number, redCell: number | null, cell: number): IconKey {
        if (redCell !== null && cell === redCell) {
            return "Red";
        }

        if (hasBit(purpleMask, cell)) {
            return "Purple";
        }

        return OQ_CLUE_COLORS[getNeighborCountFromMask(purpleMask, cell)];
    }

    function getOutcomeIcon(outcomeCode: number): IconKey {
        if (outcomeCode === 0) return "Blue";
        if (outcomeCode === 1) return "Teal";
        if (outcomeCode === 2) return "Green";
        if (outcomeCode === 3) return "Yellow";
        if (outcomeCode === 4) return "Orange";
        if (outcomeCode === 31) return "Red";
        return "Purple";
    }

    function getOutcomeLabel(outcomeCode: number) {
        if (outcomeCode === 0) return "Blue";
        if (outcomeCode === 1) return "Teal";
        if (outcomeCode === 2) return "Green";
        if (outcomeCode === 3) return "Yellow";
        if (outcomeCode === 4) return "Orange";
        if (outcomeCode === 5) return "Purple";
        if (outcomeCode >= 6 && outcomeCode < 31) return `Purple -> ${cellLabel(outcomeCode - 6)} red`;
        if (outcomeCode === 31) return "Red";
        return `Outcome ${outcomeCode}`;
    }

    function getAdjustedRewardForOutcome(outcomeCode: number, addition: number, multiplier: number) {
        if (outcomeCode === 0) return getAdjustedScore("Blue", addition, multiplier);
        if (outcomeCode === 1) return getAdjustedScore("Teal", addition, multiplier);
        if (outcomeCode === 2) return getAdjustedScore("Green", addition, multiplier);
        if (outcomeCode === 3) return getAdjustedScore("Yellow", addition, multiplier);
        if (outcomeCode === 4) return getAdjustedScore("Orange", addition, multiplier);
        if (outcomeCode === 31) return getAdjustedScore("Red", addition, multiplier);
        return 0;
    }

    function getKnownBoardOutcome(fullPurpleMask: number, redCell: number, cell: number) {
        if (cell === redCell) {
            return 31;
        }

        if (hasBit(fullPurpleMask, cell)) {
            return 5;
        }

        return getNeighborCountFromMask(fullPurpleMask, cell);
    }

    function decodeNode(view: DataView<ArrayBuffer>, offset: number): { node: OqNode; offset: number } {
        const bestCellRaw = view.getUint32(offset, true);
        offset += 4;
        const evMilli = view.getUint32(offset, true);
        offset += 4;
        const chargedLeft = view.getUint32(offset, true);
        offset += 4;
        const clickedMask = view.getUint32(offset, true);
        offset += 4;
        const foundPurpleMask = view.getUint32(offset, true);
        offset += 4;
        const redCellRaw = view.getUint32(offset, true);
        offset += 4;
        const edgeStart = view.getUint32(offset, true);
        offset += 4;
        const edgeCount = view.getUint32(offset, true);
        offset += 4;
        const aliveCount = view.getUint32(offset, true);
        offset += 4;

        return {
            node: {
                bestCell: bestCellRaw === 31 ? null : bestCellRaw,
                ev: evMilli / 1000,
                chargedLeft,
                clickedMask,
                foundPurpleMask,
                redCell: redCellRaw === 31 ? null : redCellRaw,
                edgeStart,
                edgeCount,
                aliveCount,
            },
            offset,
        };
    }

    function decodeEdge(view: DataView<ArrayBuffer>, offset: number): { edge: OqEdge; offset: number } {
        const outcomeCode = view.getUint32(offset, true);
        offset += 4;
        const childNode = view.getUint32(offset, true);
        offset += 4;
        const probabilityPpm = view.getUint32(offset, true);
        offset += 4;
        const reward = view.getUint32(offset, true);
        offset += 4;
        const boardCount = view.getUint32(offset, true);
        offset += 4;

        return {
            edge: {
                outcomeCode,
                childNode,
                probability: probabilityPpm / 1000000,
                reward,
                boardCount,
            },
            offset,
        };
    }

    async function loadOqPolicy(): Promise<OqPolicy> {
        const response = await fetch(OQ_SCORE_POLICY_URL, {
            cache: "force-cache",
        });

        if (!response.ok) {
            throw new Error(`Failed to load ${OQ_SCORE_POLICY_URL}: HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const view = new DataView(buffer);

        const magic = String.fromCharCode(
            view.getUint8(0),
            view.getUint8(1),
            view.getUint8(2),
            view.getUint8(3)
        );

        if (magic !== "OQSP") {
            throw new Error("Invalid oq_score_policy.bin file. Expected OQSP header.");
        }

        let offset = 4;

        const version = view.getUint32(offset, true);
        offset += 4;

        if (version !== 1) {
            throw new Error(`Unsupported OQ score policy version: ${version}`);
        }

        const n = view.getUint32(offset, true);
        offset += 4;
        const cells = view.getUint32(offset, true);
        offset += 4;
        const purpleCount = view.getUint32(offset, true);
        offset += 4;
        const freePurplesToFind = view.getUint32(offset, true);
        offset += 4;
        const maxChargedClicks = view.getUint32(offset, true);
        offset += 4;
        const scoreValueCount = view.getUint32(offset, true);
        offset += 4;
        const rootNodeIndex = view.getUint32(offset, true);
        offset += 4;
        const nodeCount = view.getUint32(offset, true);
        offset += 4;
        const edgeCount = view.getUint32(offset, true);
        offset += 4;

        if (n !== N || cells !== N * N) {
            throw new Error(`Invalid OQ board size: ${n}x${n}, cells=${cells}`);
        }

        if (scoreValueCount !== 6) {
            throw new Error(`Invalid OQ score value count: ${scoreValueCount}`);
        }

        const fileScoreValues: number[] = [];

        for (let i = 0; i < scoreValueCount; i++) {
            fileScoreValues.push(view.getUint32(offset, true));
            offset += 4;
        }

        const nodes: OqNode[] = [];

        for (let i = 0; i < nodeCount; i++) {
            const decoded = decodeNode(view, offset);
            nodes.push(decoded.node);
            offset = decoded.offset;
        }

        const edges: OqEdge[] = [];

        for (let i = 0; i < edgeCount; i++) {
            const decoded = decodeEdge(view, offset);
            edges.push(decoded.edge);
            offset = decoded.offset;
        }

        return {
            n,
            cells,
            purpleCount,
            freePurplesToFind,
            maxChargedClicks,
            scoreValueCount,
            rootNodeIndex,
            nodeCount,
            edgeCount,
            fileScoreValues,
            nodes,
            edges,
        };
    }

    function getNodeEdges(policy: OqPolicy, node: OqNode) {
        return policy.edges.slice(node.edgeStart, node.edgeStart + node.edgeCount);
    }

    function getAdjustedPolicyEv(
        policy: OqPolicy,
        nodeIndex: number,
        addition: number,
        multiplier: number,
        memo = new Map<number, number>()
    ): number {
        const cached = memo.get(nodeIndex);

        if (cached !== undefined) {
            return cached;
        }

        const node = policy.nodes[nodeIndex];

        if (!node || node.edgeCount === 0) {
            memo.set(nodeIndex, 0);
            return 0;
        }

        let ev = 0;

        for (const edge of getNodeEdges(policy, node)) {
            const reward = getAdjustedRewardForOutcome(edge.outcomeCode, addition, multiplier);
            ev += edge.probability * (reward + getAdjustedPolicyEv(policy, edge.childNode, addition, multiplier, memo));
        }

        memo.set(nodeIndex, ev);
        return ev;
    }

    function makeRandomPurpleMask() {
        const cells = Array.from({ length: N * N }, (_, i) => i);

        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = cells[i];
            cells[i] = cells[j];
            cells[j] = tmp;
        }

        let mask = 0;

        for (let i = 0; i < 4; i++) {
            mask |= bitOfCell(cells[i]);
        }

        return mask;
    }

    function makeRandomGame(policy: OqPolicy | null): RandomGame {
        return {
            purpleMask: makeRandomPurpleMask(),
            clickedMask: 0,
            foundPurpleMask: 0,
            redCell: null,
            nodeIndex: policy?.rootNodeIndex ?? 0,
            reveals: [],
            score: 0,
            chargedUsed: 0,
            offPolicy: false,
            done: false,
            error: null,
        };
    }

    function resolveRandomOutcome(game: RandomGame, cell: number) {
        if (game.redCell !== null && cell === game.redCell) {
            return 31;
        }

        const isPurple = hasBit(game.purpleMask, cell);

        if (!isPurple) {
            return getNeighborCountFromMask(game.purpleMask, cell);
        }

        if (game.redCell !== null) {
            return 5;
        }

        const foundCount = popcount(game.foundPurpleMask);

        if (foundCount < 2) {
            return 5;
        }

        const nextFoundMask = game.foundPurpleMask | bitOfCell(cell);
        const redMask = game.purpleMask & ~nextFoundMask;

        for (let id = 0; id < N * N; id++) {
            if (hasBit(redMask, id)) {
                return 6 + id;
            }
        }

        return 5;
    }

    function applyOutcomeToRandomGame(
        policy: OqPolicy,
        game: RandomGame,
        cell: number,
        outcomeCode: number,
        edge: OqEdge,
        addition: number,
        multiplier: number
    ): RandomGame {
        const icon = getOutcomeIcon(outcomeCode);
        const score = getAdjustedRewardForOutcome(outcomeCode, addition, multiplier);
        let nextFoundPurpleMask = game.foundPurpleMask;
        let nextRedCell = game.redCell;

        if (outcomeCode === 5) {
            nextFoundPurpleMask |= bitOfCell(cell);
        } else if (outcomeCode >= 6 && outcomeCode < 31) {
            nextFoundPurpleMask |= bitOfCell(cell);
            nextRedCell = outcomeCode - 6;
        }

        const reveal: ManualReveal = {
            cell,
            outcomeCode,
            score,
            label: getOutcomeLabel(outcomeCode),
            icon,
            revealedRedCell: outcomeCode >= 6 && outcomeCode < 31 ? outcomeCode - 6 : undefined,
        };

        const chargedUsed = game.chargedUsed + (score > 0 ? 1 : 0);

        return {
            ...game,
            nodeIndex: edge.childNode,
            clickedMask: game.clickedMask | bitOfCell(cell),
            foundPurpleMask: nextFoundPurpleMask,
            redCell: nextRedCell,
            reveals: [...game.reveals, reveal],
            score: game.score + score,
            chargedUsed,
            done: chargedUsed >= policy.maxChargedClicks || policy.nodes[edge.childNode]?.edgeCount === 0,
            error: null,
        };
    }

    function applyOutcomeToRandomGameOffPolicy(
        policy: OqPolicy,
        game: RandomGame,
        cell: number,
        outcomeCode: number,
        addition: number,
        multiplier: number,
        error: string | null
    ): RandomGame {
        const score = getAdjustedRewardForOutcome(outcomeCode, addition, multiplier);
        let nextFoundPurpleMask = game.foundPurpleMask;
        let nextRedCell = game.redCell;

        if (outcomeCode === 5) {
            nextFoundPurpleMask |= bitOfCell(cell);
        } else if (outcomeCode >= 6 && outcomeCode < 31) {
            nextFoundPurpleMask |= bitOfCell(cell);
            nextRedCell = outcomeCode - 6;
        }

        const reveal: ManualReveal = {
            cell,
            outcomeCode,
            score,
            label: getOutcomeLabel(outcomeCode),
            icon: getOutcomeIcon(outcomeCode),
            revealedRedCell: outcomeCode >= 6 && outcomeCode < 31 ? outcomeCode - 6 : undefined,
        };

        const chargedUsed = game.chargedUsed + (score > 0 ? 1 : 0);

        return {
            ...game,
            clickedMask: game.clickedMask | bitOfCell(cell),
            foundPurpleMask: nextFoundPurpleMask,
            redCell: nextRedCell,
            reveals: [...game.reveals, reveal],
            score: game.score + score,
            chargedUsed,
            offPolicy: true,
            done: chargedUsed >= policy.maxChargedClicks,
            error,
        };
    }

    const [policy, setPolicy] = useState<OqPolicy | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scoreAddition, setScoreAddition] = useState(0);
    const [scoreMultiplier, setScoreMultiplier] = useState(1);
    const [nodeIndex, setNodeIndex] = useState(0);
    const [manualReveals, setManualReveals] = useState<ManualReveal[]>([]);
    const [pendingManualRedReveal, setPendingManualRedReveal] = useState<PendingManualRedReveal | null>(null);
    const [game, setGame] = useState<RandomGame>(() => makeRandomGame(null));
    const [showRandomBoard, setShowRandomBoard] = useState(false);
    const [showHiddenGame, setShowHiddenGame] = useState(false);

    useEffect(() => {
        let cancelled = false;

        loadOqPolicy()
            .then((loadedPolicy) => {
                if (!cancelled) {
                    setPolicy(loadedPolicy);
                    setNodeIndex(loadedPolicy.rootNodeIndex);
                    setManualReveals([]);
                    setPendingManualRedReveal(null);
                    setGame(makeRandomGame(loadedPolicy));
                    setError(null);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setError(String(e));
                    setPolicy(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const currentNode = policy ? policy.nodes[nodeIndex] : null;
    const currentEdges = policy && currentNode ? getNodeEdges(policy, currentNode) : [];
    const bestCell = currentNode?.bestCell ?? null;

    const manualRedRevealEdges = currentEdges.filter((edge) => edge.outcomeCode >= 6 && edge.outcomeCode < 31);
    const manualNonRedRevealEdges = currentEdges.filter((edge) => !(edge.outcomeCode >= 6 && edge.outcomeCode < 31));
    const pendingManualRedCells = new Set((pendingManualRedReveal?.edges ?? []).map((edge) => edge.outcomeCode - 6));

    const manualClickedMask = manualReveals.reduce((mask, reveal) => mask | bitOfCell(reveal.cell), 0);

    const manualKnownRedCell = (() => {
        for (let i = manualReveals.length - 1; i >= 0; i--) {
            const redCell = manualReveals[i].revealedRedCell;

            if (redCell !== undefined) {
                return redCell;
            }
        }

        return null;
    })();

    const manualKnownPurpleMask = manualReveals.reduce((mask, reveal) => {
        if (reveal.outcomeCode === 5 || (reveal.outcomeCode >= 6 && reveal.outcomeCode < 31)) {
            return mask | bitOfCell(reveal.cell);
        }

        return mask;
    }, 0);

    const manualFullPurpleMask = manualKnownRedCell === null
        ? null
        : manualKnownPurpleMask | bitOfCell(manualKnownRedCell);

    const manualChargedUsed = manualReveals.filter((reveal) => reveal.score > 0).length;
    const manualChargedLeft = policy ? Math.max(0, policy.maxChargedClicks - manualChargedUsed) : 0;

    function getKnownBoardSuggestions(
        fullPurpleMask: number,
        redCell: number,
        clickedMask: number,
        chargedLeft: number,
        addition: number,
        multiplier: number
    ): AutoSuggestion[] {
        const candidates: AutoSuggestion[] = [];

        for (let cell = 0; cell < N * N; cell++) {
            if ((clickedMask & bitOfCell(cell)) !== 0) {
                continue;
            }

            const outcomeCode = getKnownBoardOutcome(fullPurpleMask, redCell, cell);
            const score = getAdjustedRewardForOutcome(outcomeCode, addition, multiplier);

            if (score <= 0) {
                continue;
            }

            candidates.push({
                cell,
                outcomeCode,
                icon: getOutcomeIcon(outcomeCode),
                score,
                label: getOutcomeLabel(outcomeCode),
                rank: 0,
            });
        }

        candidates.sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score;
            }

            return a.cell - b.cell;
        });

        return candidates.slice(0, chargedLeft).map((item, index) => ({
            ...item,
            rank: index + 1,
        }));
    }

    const manualAutoSuggestions = manualFullPurpleMask !== null && manualKnownRedCell !== null
        ? getKnownBoardSuggestions(
            manualFullPurpleMask,
            manualKnownRedCell,
            manualClickedMask,
            manualChargedLeft,
            scoreAddition,
            scoreMultiplier
        )
        : [];

    const manualAutoSuggestionMap = new Map<number, AutoSuggestion>();

    for (const suggestion of manualAutoSuggestions) {
        manualAutoSuggestionMap.set(suggestion.cell, suggestion);
    }

    const adjustedEvMemo = useMemo(() => new Map<number, number>(), [policy, scoreAddition, scoreMultiplier]);

    const policyRemainingEv = policy && currentNode
        ? getAdjustedPolicyEv(policy, nodeIndex, scoreAddition, scoreMultiplier, adjustedEvMemo)
        : 0;

    const autoRemainingEv = manualAutoSuggestions.reduce((sum, item) => sum + item.score, 0);
    const adjustedRemainingEv = manualFullPurpleMask !== null ? autoRemainingEv : policyRemainingEv;

    const manualScore = manualReveals.reduce((sum, reveal) => sum + reveal.score, 0);
    const manualExpectedFinal = manualScore + adjustedRemainingEv;

    const revealByCell = new Map<number, ManualReveal>();

    for (const reveal of manualReveals) {
        revealByCell.set(reveal.cell, reveal);
    }

    if (pendingManualRedReveal) {
        revealByCell.set(pendingManualRedReveal.purpleCell, {
            cell: pendingManualRedReveal.purpleCell,
            outcomeCode: 5,
            score: 0,
            label: "Purple, choose red",
            icon: "Purple",
        });
    }

    const gameNode = policy ? policy.nodes[game.nodeIndex] : null;
    const gameBestCell = gameNode?.bestCell ?? null;

    const gameRevealByCell = new Map<number, ManualReveal>();

    for (const reveal of game.reveals) {
        gameRevealByCell.set(reveal.cell, reveal);
    }

    function chooseManualOutcome(edge: OqEdge) {
        if (!policy || !currentNode || bestCell === null) {
            return;
        }

        const score = getAdjustedRewardForOutcome(edge.outcomeCode, scoreAddition, scoreMultiplier);

        const reveal: ManualReveal = {
            cell: bestCell,
            outcomeCode: edge.outcomeCode,
            score,
            label: getOutcomeLabel(edge.outcomeCode),
            icon: getOutcomeIcon(edge.outcomeCode),
            revealedRedCell: edge.outcomeCode >= 6 && edge.outcomeCode < 31 ? edge.outcomeCode - 6 : undefined,
        };

        setPendingManualRedReveal(null);
        setNodeIndex(edge.childNode);
        setManualReveals((old) => [...old, reveal]);
    }

    function startManualRedReveal() {
        if (bestCell === null || manualRedRevealEdges.length === 0) {
            return;
        }

        setPendingManualRedReveal({
            purpleCell: bestCell,
            edges: manualRedRevealEdges,
        });
    }

    function chooseManualRedCell(redCell: number) {
        if (!pendingManualRedReveal) {
            return;
        }

        const edge = pendingManualRedReveal.edges.find((candidate) => candidate.outcomeCode - 6 === redCell);

        if (!edge) {
            setError(`Policy has no red-reveal edge for ${cellLabel(redCell)} from this node.`);
            return;
        }

        chooseManualOutcome(edge);
    }

    function manualAutoClick(cell: number) {
        if (manualFullPurpleMask === null || manualKnownRedCell === null) {
            return;
        }

        if ((manualClickedMask & bitOfCell(cell)) !== 0) {
            return;
        }

        const outcomeCode = getKnownBoardOutcome(manualFullPurpleMask, manualKnownRedCell, cell);
        const score = getAdjustedRewardForOutcome(outcomeCode, scoreAddition, scoreMultiplier);

        if (score <= 0) {
            return;
        }

        const reveal: ManualReveal = {
            cell,
            outcomeCode,
            score,
            label: getOutcomeLabel(outcomeCode),
            icon: getOutcomeIcon(outcomeCode),
        };

        setManualReveals((old) => [...old, reveal]);
    }

    function resetManual() {
        if (!policy) return;

        setNodeIndex(policy.rootNodeIndex);
        setManualReveals([]);
        setPendingManualRedReveal(null);
        setError(null);
    }

    function undoManual() {
        if (!policy) {
            return;
        }

        if (pendingManualRedReveal) {
            setPendingManualRedReveal(null);
            return;
        }

        if (manualReveals.length === 0) {
            return;
        }

        let nextNodeIndex = policy.rootNodeIndex;

        for (let i = 0; i < manualReveals.length - 1; i++) {
            const reveal = manualReveals[i];

            if (reveal.outcomeCode === 31) {
                continue;
            }

            const node = policy.nodes[nextNodeIndex];
            const edge = getNodeEdges(policy, node).find((candidate) => candidate.outcomeCode === reveal.outcomeCode);

            if (!edge) {
                nextNodeIndex = policy.rootNodeIndex;
                break;
            }

            nextNodeIndex = edge.childNode;
        }

        setNodeIndex(nextNodeIndex);
        setManualReveals((old) => old.slice(0, -1));
        setPendingManualRedReveal(null);
    }

    function newRandomGame() {
        setGame(makeRandomGame(policy));
    }

    function rebuildRandomGameFromReveals(policy: OqPolicy, base: RandomGame, reveals: ManualReveal[]) {
        let rebuilt: RandomGame = {
            purpleMask: base.purpleMask,
            clickedMask: 0,
            foundPurpleMask: 0,
            redCell: null,
            nodeIndex: policy.rootNodeIndex,
            reveals: [],
            score: 0,
            chargedUsed: 0,
            offPolicy: false,
            done: false,
            error: null,
        };

        for (const reveal of reveals) {
            const node = policy.nodes[rebuilt.nodeIndex];
            const edge = !rebuilt.offPolicy && node && reveal.cell === node.bestCell
                ? getNodeEdges(policy, node).find((candidate) => candidate.outcomeCode === reveal.outcomeCode)
                : undefined;

            if (edge) {
                rebuilt = applyOutcomeToRandomGame(
                    policy,
                    rebuilt,
                    reveal.cell,
                    reveal.outcomeCode,
                    edge,
                    scoreAddition,
                    scoreMultiplier
                );
            } else {
                rebuilt = applyOutcomeToRandomGameOffPolicy(
                    policy,
                    rebuilt,
                    reveal.cell,
                    reveal.outcomeCode,
                    scoreAddition,
                    scoreMultiplier,
                    "Off-policy manual test. Recommendations are paused for this generated board."
                );
            }
        }

        return rebuilt;
    }

    function stepRandomGame(cellOverride?: number) {
        if (!policy || game.done) {
            return;
        }

        const clickedCell = cellOverride ?? gameBestCell;

        if (clickedCell === null) {
            return;
        }

        if ((game.clickedMask & bitOfCell(clickedCell)) !== 0) {
            setGame((old) => ({
                ...old,
                error: `Cell ${cellLabel(clickedCell)} was already clicked.`,
            }));
            return;
        }

        const outcomeCode = resolveRandomOutcome(game, clickedCell);
        const node = policy.nodes[game.nodeIndex];
        const edge = !game.offPolicy && node && clickedCell === node.bestCell
            ? getNodeEdges(policy, node).find((candidate) => candidate.outcomeCode === outcomeCode)
            : undefined;

        if (edge) {
            setGame((old) => applyOutcomeToRandomGame(policy, old, clickedCell, outcomeCode, edge, scoreAddition, scoreMultiplier));
            return;
        }

        const reason = game.offPolicy
            ? "Off-policy manual test. Recommendations are paused for this generated board."
            : `Clicked ${cellLabel(clickedCell)} instead of the recommended ${cellLabel(gameBestCell)}. Recommendations are paused for this generated board.`;

        setGame((old) => applyOutcomeToRandomGameOffPolicy(
            policy,
            old,
            clickedCell,
            outcomeCode,
            scoreAddition,
            scoreMultiplier,
            reason
        ));
    }

    function undoRandomGame() {
        if (!policy) {
            return;
        }

        setGame((old) => {
            if (old.reveals.length === 0) {
                return old;
            }

            return rebuildRandomGameFromReveals(policy, old, old.reveals.slice(0, -1));
        });
    }

    function renderPolicyBoard(
        title: string,
        boardReveals: Map<number, ManualReveal>,
        nextCell: number | null,
        options?: {
            onCellClick?: (cell: number) => void;
            hiddenPurpleMask?: number;
            hiddenRedCell?: number | null;
            knownRedCell?: number | null;
            showFullHiddenBoard?: boolean;
            selectableCells?: Set<number>;
            selectableIcon?: IconKey;
            selectableLabel?: string;
            autoSuggestions?: Map<number, AutoSuggestion>;
            allowAnyClick?: boolean;
            clickedMask?: number;
        }
    ) {
        const onCellClick = options?.onCellClick;
        const hiddenPurpleMask = options?.hiddenPurpleMask;
        const hiddenRedCell = options?.hiddenRedCell ?? null;
        const knownRedCell = options?.knownRedCell ?? null;
        const showFullHiddenBoard = options?.showFullHiddenBoard ?? false;
        const selectableCells = options?.selectableCells;
        const selectableIcon = options?.selectableIcon;
        const selectableLabel = options?.selectableLabel;
        const autoSuggestions = options?.autoSuggestions;
        const allowAnyClick = options?.allowAnyClick ?? false;
        const clickedMask = options?.clickedMask ?? 0;

        return (
            <div className="flex flex-col items-center">
                <div className="mb-1 text-center text-sm font-bold text-white/85">{title}</div>
                <Panel className="grid grid-cols-5 gap-2 p-[15px]">
                    {Array.from({ length: N * N }, (_, id) => {
                        const reveal = boardReveals.get(id);
                        const autoSuggestion = autoSuggestions?.get(id);
                        const isNext = id === nextCell;
                        const isSelectable = selectableCells?.has(id) ?? false;
                        const isClicked = (clickedMask & bitOfCell(id)) !== 0;
                        const isKnownRed = knownRedCell !== null && id === knownRedCell;
                        const canShowHiddenFull = showFullHiddenBoard && hiddenPurpleMask !== undefined;
                        const hiddenIcon = canShowHiddenFull ? getHiddenCellIcon(hiddenPurpleMask, hiddenRedCell, id) : null;
                        const canClick = !!onCellClick && !reveal && !isClicked && (allowAnyClick || !!autoSuggestion || isNext || isSelectable);

                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => {
                                    if (canClick) {
                                        onCellClick?.(id);
                                    }
                                }}
                                className={cn(
                                    "relative flex h-16 w-16 select-none flex-col items-center justify-center overflow-hidden rounded-[10px] border p-[4px_5px] text-[#dbdee1] transition duration-100",
                                    reveal && "border-white/20 bg-[#565a65] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]",
                                    !reveal && autoSuggestion && "border-[#a6f3a6]/80 bg-[#2f4532] shadow-[0_0_14px_rgba(120,255,120,0.20)]",
                                    !reveal && !autoSuggestion && isSelectable && "border-[#ff7070]/80 bg-[#452f35] shadow-[0_0_14px_rgba(255,80,80,0.25)]",
                                    !reveal && !autoSuggestion && !isSelectable && isNext && "border-white/70 bg-[#3a3d45] shadow-[0_0_14px_rgba(255,255,255,0.22)]",
                                    !reveal && !autoSuggestion && !isSelectable && !isNext && "border-white/[0.06] bg-[#2a2c32]",
                                    canClick && "cursor-pointer hover:-translate-y-px",
                                    onCellClick && !canClick && "cursor-not-allowed opacity-70"
                                )}
                            >
                                {reveal ? (
                                    <>
                                        <Icon src={ICONS[reveal.icon]} className="h-[24px] w-[24px]" />
                                        {reveal.score > 0 && (
                                            <span className="mt-[2px] text-[0.58rem] font-black tabular-nums text-white/80">+{reveal.score}</span>
                                        )}
                                    </>
                                ) : autoSuggestion ? (
                                    <>
                                        <Icon src={ICONS[autoSuggestion.icon]} className="h-[24px] w-[24px]" />
                                        <span className="mt-[2px] text-[0.52rem] font-black text-white/85">
                                            #{autoSuggestion.rank} +{autoSuggestion.score}
                                        </span>
                                    </>
                                ) : isSelectable ? (
                                    <>
                                        <Icon src={ICONS[selectableIcon ?? "Red"]} className="h-[24px] w-[24px]" />
                                        <span className="mt-[2px] text-[0.52rem] font-black text-white/80">{selectableLabel ?? "PICK"}</span>
                                    </>
                                ) : isKnownRed ? (
                                    <>
                                        <Icon src={ICONS.Red} className="h-[24px] w-[24px]" />
                                        <span className="mt-[2px] text-[0.52rem] font-black text-white/80">RED</span>
                                    </>
                                ) : hiddenIcon ? (
                                    <>
                                        <Icon src={ICONS[hiddenIcon]} className={cn("h-[24px] w-[24px]", !isNext && "opacity-80")} />
                                        {isNext && <span className="mt-[2px] text-[0.58rem] font-black text-white/80">NEXT</span>}
                                    </>
                                ) : isNext ? (
                                    <>
                                        <Icon src={ICONS.Mystery} className="h-[24px] w-[24px]" />
                                        <span className="mt-[2px] text-[0.58rem] font-black text-white/80">NEXT</span>
                                    </>
                                ) : null}
                                <span className="absolute bottom-[2px] right-[4px] text-[0.48rem] text-white/25">{cellLabel(id)}</span>
                            </button>
                        );
                    })}
                </Panel>
            </div>
        );
    }

    return (
        <>
            <AppTitle>Mudae '$oq' EV Assistant</AppTitle>
            <Subtitle>
                Reads <b>oq_score_policy.bin</b>. Once red is known, the manual board switches to exact known-board scoring.
            </Subtitle>

            {error && (
                <Panel className="mb-3 max-w-[760px] p-3 text-sm font-bold text-[#ff8d8d]">
                    {error}
                </Panel>
            )}

            {!policy && !error && (
                <Panel className="mb-3 max-w-[520px] p-3 text-sm">
                    Loading <b>oq_score_policy.bin</b>...
                </Panel>
            )}

            {policy && currentNode && (
                <>
                    <Panel className="mb-3 flex flex-wrap items-center justify-center gap-3 p-3 text-sm">
                        <span>
                            Node <b>{manualFullPurpleMask !== null ? "known" : nodeIndex}</b> / {policy.nodeCount}
                        </span>
                        <span>
                            Alive <b>{manualFullPurpleMask !== null ? 1 : currentNode.aliveCount}</b>
                        </span>
                        <span>
                            Charged left <b>{manualChargedLeft}</b>
                        </span>
                        <span>
                            Next <b>{manualAutoSuggestions[0] ? cellLabel(manualAutoSuggestions[0].cell) : cellLabel(bestCell)}</b>
                        </span>
                        <span>
                            Score <b>{manualScore.toFixed(0)}</b>
                        </span>
                        <span>
                            EV left <b>{adjustedRemainingEv.toFixed(1)}</b>
                        </span>
                        <span>
                            Expected final <b>{manualExpectedFinal.toFixed(1)}</b>
                        </span>
                    </Panel>

                    <Panel className="mb-3 flex flex-wrap items-center justify-center gap-3 p-3 text-sm">
                        <label className="flex items-center gap-2">
                            Add
                            <input
                                type="number"
                                value={scoreAddition}
                                step={2}
                                onChange={(e) => setScoreAddition(Number(e.target.value) || 0)}
                                className="w-16 rounded bg-[#1e1f22] px-2 py-1 text-right text-white"
                            />
                        </label>
                        <label className="flex items-center gap-2">
                            Mult
                            <select
                                value={scoreMultiplier}
                                onChange={(e) => setScoreMultiplier(Number(e.target.value) || 1)}
                                className="rounded bg-[#1e1f22] px-2 py-1 text-white"
                            >
                                <option value={1}>x1</option>
                                <option value={2}>x2</option>
                            </select>
                        </label>
                        <button type="button" onClick={undoManual} className="rounded bg-white/10 px-3 py-1 font-bold hover:bg-white/15">
                            Undo
                        </button>
                        <button type="button" onClick={resetManual} className="rounded bg-[#d83c3f] px-3 py-1 font-bold text-white hover:opacity-90">
                            Reset manual
                        </button>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showRandomBoard}
                                onChange={(e) => setShowRandomBoard(e.target.checked)}
                            />
                            Show random test board
                        </label>
                        {showRandomBoard && (
                            <>
                                <button type="button" onClick={newRandomGame} className="rounded bg-white/10 px-3 py-1 font-bold hover:bg-white/15">
                                    New random
                                </button>
                                <button type="button" onClick={() => stepRandomGame()} className="rounded bg-white/10 px-3 py-1 font-bold hover:bg-white/15">
                                    Step random
                                </button>
                                <button type="button" onClick={undoRandomGame} className="rounded bg-white/10 px-3 py-1 font-bold hover:bg-white/15">
                                    Undo random
                                </button>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showHiddenGame}
                                        onChange={(e) => setShowHiddenGame(e.target.checked)}
                                    />
                                    Show hidden
                                </label>
                            </>
                        )}
                    </Panel>

                    <div className="mb-3 flex flex-col items-start justify-center gap-4 lg:flex-row">
                        {renderPolicyBoard("Manual policy board", revealByCell, manualFullPurpleMask !== null ? manualAutoSuggestions[0]?.cell ?? null : bestCell, {
                            onCellClick: (cell) => {
                                if (manualFullPurpleMask !== null) {
                                    manualAutoClick(cell);
                                } else if (pendingManualRedReveal) {
                                    chooseManualRedCell(cell);
                                }
                            },
                            knownRedCell: manualKnownRedCell,
                            selectableCells: pendingManualRedCells,
                            selectableIcon: "Red",
                            selectableLabel: "RED",
                            autoSuggestions: manualAutoSuggestionMap,
                        })}

                        {showRandomBoard && renderPolicyBoard("Random test board", gameRevealByCell, gameBestCell, {
                            onCellClick: (cell) => stepRandomGame(cell),
                            hiddenPurpleMask: game.purpleMask,
                            hiddenRedCell: game.redCell,
                            knownRedCell: game.redCell,
                            showFullHiddenBoard: showHiddenGame,
                            allowAnyClick: true,
                            clickedMask: game.clickedMask,
                        })}
                    </div>

                    <div className={cn("mb-3 grid w-full max-w-[760px] grid-cols-1 gap-3", showRandomBoard && "lg:grid-cols-2")}>
                        <Panel className="p-3 text-sm">
                            <div className="mb-2 text-center font-bold">Manual reveal result</div>
                            {manualFullPurpleMask !== null ? (
                                <div className="flex flex-col gap-2">
                                    <div className="rounded bg-[#263828] p-2 text-center font-bold text-[#a6f3a6]">
                                        Red is known. Remaining clicks are exact from the full purple layout.
                                    </div>
                                    {manualAutoSuggestions.length === 0 ? (
                                        <div className="text-center text-[#a6f3a6]">No scoring clicks remain.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {manualAutoSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion.cell}
                                                    type="button"
                                                    onClick={() => manualAutoClick(suggestion.cell)}
                                                    className="flex items-center justify-between gap-2 rounded bg-white/5 px-2 py-2 text-left hover:bg-white/10"
                                                >
                                                    <span className="flex items-center gap-1 font-bold">
                                                        #{suggestion.rank}
                                                        <Icon src={ICONS[suggestion.icon]} className="h-4 w-4" />
                                                        {cellLabel(suggestion.cell)} {suggestion.label}
                                                    </span>
                                                    <span className="text-right text-[0.68rem] tabular-nums text-white/70">
                                                        +{suggestion.score}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : currentEdges.length === 0 ? (
                                <div className="text-center text-[#a6f3a6]">Policy branch is finished.</div>
                            ) : pendingManualRedReveal ? (
                                <div className="rounded bg-[#452f35] p-2 text-center font-bold text-[#ffb3b3]">
                                    Click the actual revealed red cell on the manual board.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {manualNonRedRevealEdges.map((edge) => {
                                            const icon = getOutcomeIcon(edge.outcomeCode);
                                            const reward = getAdjustedRewardForOutcome(edge.outcomeCode, scoreAddition, scoreMultiplier);
                                            const futureEv = getAdjustedPolicyEv(policy, edge.childNode, scoreAddition, scoreMultiplier, adjustedEvMemo);

                                            return (
                                                <button
                                                    key={`${edge.outcomeCode}-${edge.childNode}`}
                                                    type="button"
                                                    onClick={() => chooseManualOutcome(edge)}
                                                    className="flex items-center justify-between gap-2 rounded bg-white/5 px-2 py-2 text-left hover:bg-white/10"
                                                >
                                                    <span className="flex items-center gap-1 font-bold">
                                                        <Icon src={ICONS[icon]} className="h-4 w-4" />
                                                        {getOutcomeLabel(edge.outcomeCode)}
                                                    </span>
                                                    <span className="text-right text-[0.68rem] tabular-nums text-white/70">
                                                        {edge.probability > 0 ? `${Math.round(edge.probability * 100)}%` : ""}
                                                        {reward > 0 ? ` +${reward}` : ""}
                                                        <br />
                                                        EV {futureEv.toFixed(1)}
                                                    </span>
                                                </button>
                                            );
                                        })}

                                        {manualRedRevealEdges.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={startManualRedReveal}
                                                className="flex items-center justify-between gap-2 rounded bg-[#452f35] px-2 py-2 text-left hover:bg-[#553940]"
                                            >
                                                <span className="flex items-center gap-1 font-bold text-[#ffb3b3]">
                                                    <Icon src={ICONS.Purple} className="h-4 w-4" />
                                                    Purple, reveal red
                                                </span>
                                                <span className="text-right text-[0.68rem] tabular-nums text-white/70">
                                                    choose red cell
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Panel>

                        {showRandomBoard && (
                            <Panel className="p-3 text-sm">
                                <div className="mb-2 text-center font-bold">Random game stats</div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                    <span className="text-white/60">Score</span>
                                    <span className="text-right font-bold tabular-nums">{game.score}</span>
                                    <span className="text-white/60">Charged used</span>
                                    <span className="text-right font-bold tabular-nums">{game.chargedUsed}</span>
                                    <span className="text-white/60">Node</span>
                                    <span className="text-right font-bold tabular-nums">{game.offPolicy ? "paused" : game.nodeIndex}</span>
                                    <span className="text-white/60">Next</span>
                                    <span className="text-right font-bold">{cellLabel(gameBestCell)}</span>
                                    <span className="text-white/60">Found purples</span>
                                    <span className="text-right font-bold tabular-nums">{popcount(game.foundPurpleMask)}</span>
                                    <span className="text-white/60">Red</span>
                                    <span className="text-right font-bold">{cellLabel(game.redCell)}</span>
                                    <span className="text-white/60">Hidden purples</span>
                                    <span className="text-right font-bold">
                                        {Array.from({ length: N * N }, (_, id) => id)
                                            .filter((id) => hasBit(game.purpleMask, id))
                                            .map(cellLabel)
                                            .join(", ")}
                                    </span>
                                </div>
                                {game.error && (
                                    <div className="mt-2 rounded bg-[#3a1f1f] p-2 font-bold text-[#ff8d8d]">
                                        {game.error}
                                    </div>
                                )}
                            </Panel>
                        )}
                    </div>

                    <Panel className="w-full max-w-[760px] p-3 text-xs text-white/75">
                        <div className="mb-1 font-bold text-white/90">Manual history</div>
                        {manualReveals.length === 0 ? (
                            <div>No reveals yet.</div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {manualReveals.map((reveal, i) => (
                                    <span key={`${reveal.cell}-${i}`} className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-1">
                                        {cellLabel(reveal.cell)}
                                        <Icon src={ICONS[reveal.icon]} className="h-4 w-4" />
                                        {reveal.label}
                                        {reveal.score > 0 ? ` +${reveal.score}` : ""}
                                    </span>
                                ))}
                            </div>
                        )}
                    </Panel>
                </>
            )}
        </>
    );
}



export default function MudaeSolversReact() {
    const [tab, setTab] = useState<SolverTab>("oc");

    return (
        <SolverShell>
            <SolverTabs value={tab} onChange={setTab} />
            {tab === "oc" && <OcSolver />}
            {tab === "oq" && <OqSolver />}
            {tab === "ot" && <OtSolver />}
            {tab === "ocscore" && <OcScoreSolver />}
            {tab === "oqscore" && <OqScoreSolver />}
        </SolverShell>
    );
}
