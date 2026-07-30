import type { CSSProperties, HTMLAttributes } from "react";

const ANDROID_WIDTH = 900;
const ANDROID_HEIGHT = 1860;
const SCREEN_X = 67;
const SCREEN_Y = 120;
const SCREEN_WIDTH = 766;
const SCREEN_HEIGHT = 1635;

const LEFT_PCT = (SCREEN_X / ANDROID_WIDTH) * 100;
const TOP_PCT = (SCREEN_Y / ANDROID_HEIGHT) * 100;
const WIDTH_PCT = (SCREEN_WIDTH / ANDROID_WIDTH) * 100;
const HEIGHT_PCT = (SCREEN_HEIGHT / ANDROID_HEIGHT) * 100;

type AndroidMode = "default" | "simple";

export interface AndroidProps extends HTMLAttributes<HTMLDivElement> {
  imageSrc?: string;
  videoSrc?: string;
  mode?: AndroidMode;
  width?: number | string;
  height?: number | string;
}

export function Android({
  children,
  imageSrc,
  videoSrc,
  mode = "default",
  width,
  height,
  className,
  style,
  ...props
}: AndroidProps) {
  const hasVideo = Boolean(videoSrc);
  const hasMedia = hasVideo || Boolean(imageSrc);
  const hasChildren = Boolean(children);

  const sizeStyle: CSSProperties = {
    aspectRatio: `${ANDROID_WIDTH}/${ANDROID_HEIGHT}`,
  };

  if (width !== undefined) {
    sizeStyle.width = width;
  }

  if (height !== undefined) {
    sizeStyle.height = height;
  }

  return (
    <div
      className={`relative inline-block w-full align-middle leading-none ${className ?? ""}`}
      style={{
        ...sizeStyle,
        ...style,
      }}
      {...props}
    >
      {hasVideo && (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden rounded-[8%]"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
          }}
        >
          <video
            className="block size-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>
      )}

      {!hasVideo && imageSrc && (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden rounded-[8%]"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
          }}
        >
          <img
            src={imageSrc}
            alt=""
            className="block size-full object-cover object-top"
          />
        </div>
      )}

      {!hasMedia && hasChildren && (
        <div
          className="absolute z-0 overflow-hidden rounded-[8%] [container-type:inline-size]"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
          }}
        >
          {children}
        </div>
      )}

      <svg
        viewBox={`0 0 ${ANDROID_WIDTH} ${ANDROID_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 z-10 size-full"
        style={{ transform: "translateZ(0)" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="androidFrameLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F1F1F1" />
            <stop offset="100%" stopColor="#D9D9D9" />
          </linearGradient>
          <linearGradient id="androidFrameDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A3A3A" />
            <stop offset="100%" stopColor="#1F1F1F" />
          </linearGradient>
          <linearGradient id="androidBezelLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111111" />
            <stop offset="100%" stopColor="#232323" />
          </linearGradient>
          <linearGradient id="androidBezelDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070707" />
            <stop offset="100%" stopColor="#181818" />
          </linearGradient>
          <clipPath id="androidScreenClip">
            <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} rx="82" />
          </clipPath>
        </defs>

        <g>
          <path
            d="M133 18C133 8.05887 141.059 0 151 0H749C758.941 0 767 8.05887 767 18V72C767 82.4934 775.507 91 786 91H807C824.673 91 839 105.327 839 123V1737C839 1776.21 807.211 1808 768 1808H132C92.7887 1808 61 1776.21 61 1737V123C61 105.327 75.3269 91 93 91H114C124.493 91 133 82.4934 133 72V18Z"
            className="fill-[url(#androidFrameLight)] dark:fill-[url(#androidFrameDark)]"
          />

          <path
            d="M121 116C121 89.4903 142.49 68 169 68H731C757.51 68 779 89.4903 779 116V1720C779 1754.21 751.21 1782 717 1782H183C148.791 1782 121 1754.21 121 1720V116Z"
            className="fill-[url(#androidBezelLight)] dark:fill-[url(#androidBezelDark)]"
          />

          <rect
            x="148"
            y="143"
            width="604"
            height="1542"
            rx="60"
            className="fill-[#0D0F14]"
          />

          <g clipPath="url(#androidScreenClip)">
            <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="#10131A" />
            {hasMedia || hasChildren ? (
              <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="#0B0D12" opacity="0.16" />
            ) : null}
          </g>

          <circle cx="449" cy="94" r="32" className="fill-[#050505]" />
          <circle cx="449" cy="94" r="14" className="fill-[#151515] dark:fill-[#050505]" />
          <circle cx="449" cy="94" r="7" className="fill-[#5B8CFF]" />

          {mode === "default" ? (
            <>
              <rect x="44" y="387" width="18" height="145" rx="9" className="fill-[#D1D5DB] dark:fill-[#707070]" />
              <rect x="44" y="559" width="18" height="145" rx="9" className="fill-[#D1D5DB] dark:fill-[#707070]" />
              <rect x="838" y="466" width="18" height="260" rx="9" className="fill-[#D1D5DB] dark:fill-[#707070]" />
              <rect x="413" y="1736" width="74" height="7" rx="3.5" className="fill-[#D1D5DB] dark:fill-[#6B7280]" />
            </>
          ) : null}
        </g>
      </svg>
    </div>
  );
}