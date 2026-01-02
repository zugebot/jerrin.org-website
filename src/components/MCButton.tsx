// src/components/MCButton.tsx
import { useEffect, useMemo, useState } from "react";
import { makeSound } from "../lib/sound";

type MCButtonProps = {
    label: string;
    onClick?: () => void;
    disabled?: boolean;

    // hardcoded “Minecraft GUI” sizes (px)
    w?: number; // default 200
    h?: number; // default 20
    fontPx?: number; // default 10

    // icon support
    iconSrc?: string;
    iconAlt?: string;
    iconSize?: number; // default: h - 4
    iconPadLeft?: number; // default: 3
    textPadRight?: number; // default: 6
};

function useDpr() {
    const [dpr, setDpr] = useState(() => window.devicePixelRatio || 1);
    useEffect(() => {
        const onResize = () => setDpr(window.devicePixelRatio || 1);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return dpr;
}

export default function MCButton({
                                     label,
                                     onClick,
                                     disabled,
                                     w = 200,
                                     h = 20,
                                     fontPx = 10,

                                     iconSrc,
                                     iconAlt = "",
                                     iconSize,
                                     iconPadLeft = 4,
                                     textPadRight = 6,
                                 }: MCButtonProps) {
    const hoverSound = useMemo(() => makeSound("/audio/focus.wav"), []);
    const clickSound = useMemo(() => makeSound("/audio/press.wav"), []);

    const textShadow: string = "#3c4143";
    const textShadowHover: string = "#3F4505";

    const [isHover, setIsHover] = useState(false);

    const hasIcon = Boolean(iconSrc);
    const sz = iconSize ?? Math.max(10, h - 4);

    const dpr = useDpr();
    const px = 1 / dpr; // 1 physical pixel; change to 2/dpr, 3/dpr, etc if you want thicker

    const shadowColor = isHover && !disabled ? textShadowHover : textShadow;
    const shadow = `${px}px ${px}px 0 ${shadowColor}`;

    return (
        <button
            type="button"
            disabled={disabled}
            onMouseEnter={() => {
                if (!disabled) hoverSound();
                setIsHover(true);
            }}
            onMouseLeave={() => setIsHover(false)}
            onMouseDown={() => {
                if (disabled) return;
                clickSound();
                onClick?.();
            }}
            className={[
                "group relative select-none border-0",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                "text-[#f5f4f5] hover:text-[#FFFF55]",
                "leading-none",
                hasIcon ? "grid items-center" : "flex items-center justify-center",
            ].join(" ")}
            style={{
                width: w,
                height: h,
                fontSize: fontPx,
                ...(hasIcon
                    ? {
                        gridTemplateColumns: `${sz}px ${Math.max(2, Math.floor(sz * 0.35))}px 1fr`,
                        paddingLeft: iconPadLeft,
                        paddingRight: textPadRight,
                    }
                    : {}),
            }}
        >
            {/* base skin */}
            <img
                src="/menu/BG_Button.png"
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{ imageRendering: "pixelated" }}
            />

            {/* hover skin */}
            {!disabled && (
                <img
                    src="/menu/BB_Button.png"
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-0 group-hover:opacity-100"
                    style={{ imageRendering: "pixelated" }}
                />
            )}

            {/* content */}
            {hasIcon ? (
                <>
                    {/* icon stack */}
                    <div
                        className="relative flex items-center justify-center w-[16px] h-[16px]"
                        style={{ width: sz, height: sz }}
                    >
                        {/* enchant background */}
                        <img
                            src="/menu/a_enchant_purple.png"
                            alt=""
                            draggable={false}
                            className="absolute inset-0 pointer-events-none w-[16px] h-[16px]"
                            style={{ imageRendering: "pixelated" }}
                        />

                        {/* main icon */}
                        <img
                            src={iconSrc}
                            alt={iconAlt}
                            draggable={false}
                            className="relative pointer-events-none p-[1px] w-[14px] h-[14px]"
                            style={{
                                width: sz,
                                height: sz,
                                imageRendering: "pixelated",
                            }}
                        />
                    </div>

                    {/* spacer column */}
                    <span className="relative z-10" />

                    {/* label */}
                    <span
                        className="pointer-events-none relative z-10 whitespace-nowrap overflow-hidden text-ellipsis text-left"
                        style={{ textShadow: shadow }}
                    >
      {label}
    </span>
                </>
            ) : (
                <span
                    className="pointer-events-none relative z-10 whitespace-nowrap overflow-hidden text-ellipsis w-full"
                    style={{ textShadow: shadow }}
                >
    {label}
  </span>
            )}
        </button>
    );
}
