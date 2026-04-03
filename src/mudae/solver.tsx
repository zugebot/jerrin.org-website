import React, { useMemo, useState } from "react";

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
    return `${Math.round(prob * 100)}%`;
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
            <div className="mx-auto flex w-fit flex-col items-center justify-center [zoom:1] sm:[zoom:1.25] md:[zoom:1.5] lg:[zoom:1.75]">
                {children}
            </div>
        </div>
    );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("rounded-xl bg-[#2b2d31]", className)}>{children}</div>;
}

function PaletteButton({
                           active,
                           clear,
                           icon,
                           label,
                           onClick,
                       }: {
    active?: boolean;
    clear?: boolean;
    icon?: string;
    label?: string;
    onClick: () => void;
}) {
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

function SolverTabs({ value, onChange }: { value: "oc" | "oq" | "ot"; onChange: (v: "oc" | "oq" | "ot") => void }) {
    const tabs: Array<{ key: "oc" | "oq" | "ot"; label: string }> = [
        { key: "oc", label: "$oc" },
        { key: "oq", label: "$oq" },
        { key: "ot", label: "$ot" },
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
    const MAX_CLICKS = 7;
    const CLUE_VALUE: Record<string, number> = { Blue: 0, Teal: 1, Green: 2, Yellow: 3, Orange: 4 };
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

    const countNonPurpleClicks = (src: Board) => src.flat().filter((x) => x && x !== "Purple").length;
    const countPurples = (src: Board) => src.flat().filter((x) => x === "Purple").length;

    const analysis = useMemo(() => {
        const must: number[] = [];
        const forbid: number[] = [];
        const clues: Array<{ id: number; req: number }> = [];

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const s = board[r][c];
                const id = r * N + c;
                if (s === "Purple") must.push(id);
                else if (s) {
                    forbid.push(id);
                    clues.push({ id, req: CLUE_VALUE[s] ?? 0 });
                }
            }
        }

        let total = 0;
        const counts = Array(N * N).fill(0);

        for (let a = 0; a < 25; a++) {
            for (let b = a + 1; b < 25; b++) {
                for (let c = b + 1; c < 25; c++) {
                    for (let d = c + 1; d < 25; d++) {
                        const set = [a, b, c, d];
                        if (!must.every((x) => set.includes(x))) continue;
                        if (forbid.some((x) => set.includes(x))) continue;

                        let ok = true;
                        for (const cl of clues) {
                            let cnt = 0;
                            const rr = Math.floor(cl.id / 5);
                            const cc = cl.id % 5;
                            for (const x of set) {
                                const r = Math.floor(x / 5);
                                const c = x % 5;
                                if (Math.abs(r - rr) <= 1 && Math.abs(c - cc) <= 1 && !(r === rr && c === cc)) cnt++;
                            }
                            if (cnt !== cl.req) {
                                ok = false;
                                break;
                            }
                        }

                        if (!ok) continue;
                        total++;
                        set.forEach((x) => counts[x]++);
                    }
                }
            }
        }

        return { total, counts };
    }, [board]);

    function onCellClick(r: number, c: number) {
        setBoard((prev) => {
            const nextValue = currentInk === "None" ? null : currentInk;
            const prior = prev[r][c];
            if (prior === null && nextValue && nextValue !== "Purple" && countNonPurpleClicks(prev) >= MAX_CLICKS) {
                return prev;
            }
            const next = prev.map((row) => [...row]);
            next[r][c] = nextValue as CellMark;
            return next;
        });
    }

    const purples = countPurples(board);
    const nonPurpleCount = countNonPurpleClicks(board);

    return (
        <>
            <AppTitle>Mudae '$oq' Assistant</AppTitle>
            <Subtitle>
                You get <b>7 non-purple clicks</b>. Purples are free.
                <br />
                Blue=0, Teal=1, Green=2, Yellow=3, Orange=4 neighboring purples.
            </Subtitle>

            <Panel className="mb-[18px] grid grid-cols-5 gap-2 rounded-lg p-[15px]">
                {Array.from({ length: 25 }, (_, i) => {
                    const r = Math.floor(i / N);
                    const c = i % N;
                    const state = board[r][c];
                    const p = analysis.total ? Math.round((analysis.counts[i] / analysis.total) * 100) : 0;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onCellClick(r, c)}
                            className={cn(
                                "flex h-[45px] w-[60px] select-none flex-col items-center justify-center rounded-md border border-black/10 text-[#dbdee1]",
                                state ? "bg-[#4e5058]" : p ? "bg-[#5865f2] text-white" : "bg-[#232428] text-[#8a8f98]",
                                nonPurpleCount >= MAX_CLICKS && !state && "cursor-not-allowed",
                                !state && "hover:opacity-90"
                            )}
                        >
                            {state ? (
                                <Icon src={ICONS[state as IconKey]} className="h-[22px] w-[22px]" />
                            ) : (
                                <>
                                    <Icon src={purples >= TOTAL_PURPLES - 1 ? ICONS.Red : ICONS.Purple} className="h-[22px] w-[22px]" />
                                    <div className="mt-[2px] text-[0.78rem] font-black leading-none">{p}%</div>
                                </>
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
                    setCurrentInk("None");
                }}
            />
        </>
    );
}

function OcSolver() {
    const CENTER = { r: 2, c: 2 };
    const ORANGE_COUNT = 2;
    const YELLOW_COUNT = 3;
    const paletteInks: PaletteInk[] = [
        { key: "None", icon: ICONS.Mystery },
        { key: "Teal", icon: ICONS.Teal },
        { key: "Blue", icon: ICONS.Blue },
        { key: "Yellow", icon: ICONS.Yellow },
        { key: "Green", icon: ICONS.Green },
        { key: "Orange", icon: ICONS.Orange },
        { key: "Red", icon: ICONS.Red },
        { key: "Clear" },
    ];

    const [board, setBoard] = useState<Board>(() => makeEmptyBoard());
    const [currentInk, setCurrentInk] = useState("None");
    const [showOrangeBoxes, setShowOrangeBoxes] = useState(false);
    const [showYellowBoxes, setShowYellowBoxes] = useState(false);

    const helpers = useMemo(() => {
        const isCenter = (r: number, c: number) => r === CENTER.r && c === CENTER.c;
        const inBounds = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;
        const getMark = (src: Board, r: number, c: number) => src[r][c];
        const getPlacedCount = (src: Board, color: string) => src.flat().filter((v) => v === color).length;
        const getPlacedRedCell = (src: Board): [number, number] | null => {
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (src[r][c] === "Red") return [r, c];
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
                if (inBounds(r, c) && !isCenter(r, c)) out.push([r, c]);
            }
            return out;
        };

        const getDiagonalCells = (rr: number, rc: number) => {
            const out: Array<[number, number]> = [];
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (r === rr && c === rc) continue;
                    if (isCenter(r, c)) continue;
                    if (isDiagonal(r, c, rr, rc)) out.push([r, c]);
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

        const getOrangeDistributionForRed = (src: Board, rr: number, rc: number) => {
            const orth = getOrthCells(rr, rc);
            const forced: Array<[number, number]> = [];
            const open: Array<[number, number]> = [];
            for (const [r, c] of orth) {
                const mark = getMark(src, r, c);
                if (mark === "Orange") forced.push([r, c]);
                else if (mark === null) open.push([r, c]);
            }
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (getMark(src, r, c) !== "Orange") continue;
                    if (!isOrthAdjacent(r, c, rr, rc)) return null;
                }
            }
            if (forced.length > ORANGE_COUNT) return null;
            const need = ORANGE_COUNT - forced.length;
            const combos = combinations(open, need);
            if (combos.length === 0) return null;
            const weights = Array.from({ length: N }, () => Array(N).fill(0));
            for (const extra of combos) {
                const set = [...forced, ...extra];
                for (const [r, c] of set) weights[r][c] += 1;
            }
            return { comboCount: combos.length, weights };
        };

        const getYellowDistributionForRed = (src: Board, rr: number, rc: number) => {
            const diag = getDiagonalCells(rr, rc);
            const forced: Array<[number, number]> = [];
            const open: Array<[number, number]> = [];
            for (const [r, c] of diag) {
                const mark = getMark(src, r, c);
                if (mark === "Yellow") forced.push([r, c]);
                else if (mark === null) open.push([r, c]);
            }
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (getMark(src, r, c) !== "Yellow") continue;
                    if (!isDiagonal(r, c, rr, rc)) return null;
                }
            }
            if (forced.length > YELLOW_COUNT) return null;
            const need = YELLOW_COUNT - forced.length;
            const combos = combinations(open, need);
            if (combos.length === 0) return null;
            const weights = Array.from({ length: N }, () => Array(N).fill(0));
            for (const extra of combos) {
                const set = [...forced, ...extra];
                for (const [r, c] of set) weights[r][c] += 1;
            }
            return { comboCount: combos.length, weights };
        };

        const boardHasAnyConsistentSolution = (src: Board) => {
            const candidateReds = getCandidateRedCells(src);
            if (candidateReds.length === 0) return false;
            for (const [rr, rc] of candidateReds) {
                const orangeDist = getOrangeDistributionForRed(src, rr, rc);
                const yellowDist = getYellowDistributionForRed(src, rr, rc);
                if (orangeDist && yellowDist) return true;
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
                boardHasAnyConsistentSolution(copy)
            );
        };

        const analyzeBoard = (src: Board) => {
            const candidateReds = getCandidateRedCells(src);
            const redPct = Array.from({ length: N }, () => Array(N).fill(0));
            const orangePct = Array.from({ length: N }, () => Array(N).fill(0));
            const yellowPct = Array.from({ length: N }, () => Array(N).fill(0));
            if (candidateReds.length === 0) return { candidateReds, redPct, orangePct, yellowPct };
            const redWeight = 1 / candidateReds.length;
            for (const [rr, rc] of candidateReds) {
                redPct[rr][rc] += redWeight;
                const orangeDist = getOrangeDistributionForRed(src, rr, rc);
                if (orangeDist) {
                    const { weights, comboCount } = orangeDist;

                    for (let r = 0; r < N; r++) {
                        for (let c = 0; c < N; c++) {
                            if (weights[r][c] > 0) {
                                orangePct[r][c] += redWeight * (weights[r][c] / comboCount);
                            }
                        }
                    }
                }

                const yellowDist = getYellowDistributionForRed(src, rr, rc);
                if (yellowDist) {
                    const { weights, comboCount } = yellowDist;

                    for (let r = 0; r < N; r++) {
                        for (let c = 0; c < N; c++) {
                            if (weights[r][c] > 0) {
                                yellowPct[r][c] += redWeight * (weights[r][c] / comboCount);
                            }
                        }
                    }
                }
            }
            return { candidateReds, redPct, orangePct, yellowPct };
        };

        return { isCenter, canPlaceMarkAt, analyzeBoard, getPlacedCount };
    }, []);

    const analysis = useMemo(() => helpers.analyzeBoard(board), [board, helpers]);

    const getActiveTier = () => {
        const redCount = helpers.getPlacedCount(board, "Red");
        const orangeCount = helpers.getPlacedCount(board, "Orange");
        if (redCount === 0) return "Red";
        if (orangeCount < ORANGE_COUNT) return "Orange";
        return "Yellow";
    };

    const getMaxGridValue = (grid: number[][]) => Math.max(...grid.flat(), 0);
    const maxima = {
        redMax: getMaxGridValue(analysis.redPct),
        orangeMax: getMaxGridValue(analysis.orangePct),
        yellowMax: getMaxGridValue(analysis.yellowPct),
    };

    const tier = getActiveTier();

    const getRowTextColor = (kind: "Red" | "Orange" | "Yellow", value: number, maxValue: number) => {
        if (value <= 0 || maxValue <= 0) return "rgb(219, 222, 225)";
        const normalized = value / maxValue;
        const curved = Math.pow(normalized, 4);
        const paleMap = {
            Red: [235, 220, 220] as [number, number, number],
            Orange: [236, 226, 214] as [number, number, number],
            Yellow: [236, 235, 210] as [number, number, number],
        };
        const vividMap = {
            Red: [255, 70, 70] as [number, number, number],
            Orange: [255, 170, 55] as [number, number, number],
            Yellow: [255, 235, 40] as [number, number, number],
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
                    const orangeProb = helpers.isCenter(r, c)
                        ? 0
                        : state === "Orange"
                            ? 1
                            : state
                                ? 0
                                : analysis.orangePct[r][c];
                    const yellowProb = helpers.isCenter(r, c)
                        ? 0
                        : state === "Yellow"
                            ? 1
                            : state
                                ? 0
                                : analysis.yellowPct[r][c];
                    const hasAnyChance =
                        redProb > 0 ||
                        (showOrangeBoxes && orangeProb > 0) ||
                        (showYellowBoxes && yellowProb > 0);
                    const displayMode = helpers.isCenter(r, c) ? "center" : state ? "marked" : hasAnyChance ? "live" : "empty";

                    const allRows: Array<{
                        kind: "Red" | "Orange" | "Yellow";
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
                    ];

                    const rows = allRows.filter((row) => {
                        if (row.prob <= 0) return false;
                        if (row.kind === "Orange" && !showOrangeBoxes) return false;
                        return !(row.kind === "Yellow" && !showYellowBoxes);

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
                        checked={showOrangeBoxes}
                        onChange={(e) => setShowOrangeBoxes(e.target.checked)}
                        className="h-4 w-4"
                    />
                    Show orange kakera %
                </label>

                <label className="flex items-center gap-2 text-sm text-[#dbdee1]">
                    <input
                        type="checkbox"
                        checked={showYellowBoxes}
                        onChange={(e) => setShowYellowBoxes(e.target.checked)}
                        className="h-4 w-4"
                    />
                    Show yellow kakera %
                </label>
            </Panel>
        </>
    );
}

function OtSolver() {
    const COLOR_ORDER = ["Blue", "Teal", "Green", "Yellow", "Orange", "Black"] as const;
    const paletteInks: PaletteInk[] = [
        { key: "None", icon: ICONS.Mystery },
        { key: "Blue", icon: ICONS.Blue },
        { key: "Teal", icon: ICONS.Teal },
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

export default function MudaeSolversReact() {
    const [tab, setTab] = useState<"oc" | "oq" | "ot">("oc");

    return (
        <SolverShell>
            <SolverTabs value={tab} onChange={setTab} />
            {tab === "oc" && <OcSolver />}
            {tab === "oq" && <OqSolver />}
            {tab === "ot" && <OtSolver />}
        </SolverShell>
    );
}
