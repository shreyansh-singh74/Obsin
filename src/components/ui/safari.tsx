import type { CSSProperties, HTMLAttributes } from "react";

const SAFARI_WIDTH = 1203;
const SAFARI_HEIGHT = 753;
const SCREEN_X = 1;
const SCREEN_Y = 52;
const SCREEN_WIDTH = 1200;
const SCREEN_HEIGHT = 700;

const LEFT_PCT = (SCREEN_X / SAFARI_WIDTH) * 100;
const TOP_PCT = (SCREEN_Y / SAFARI_HEIGHT) * 100;
const WIDTH_PCT = (SCREEN_WIDTH / SAFARI_WIDTH) * 100;
const HEIGHT_PCT = (SCREEN_HEIGHT / SAFARI_HEIGHT) * 100;

type SafariMode = "default" | "simple";

export interface SafariProps extends HTMLAttributes<HTMLDivElement> {
  url?: string;
  imageSrc?: string;
  videoSrc?: string;
  mode?: SafariMode;
  width?: number | string;
  height?: number | string;
}

export function Safari({
  children,
  imageSrc,
  videoSrc,
  url,
  mode = "default",
  width,
  height,
  className,
  style,
  ...props
}: SafariProps) {
  const hasVideo = Boolean(videoSrc);
  const hasMedia = hasVideo || Boolean(imageSrc);
  const hasChildren = Boolean(children);

  const sizeStyle: CSSProperties = {
    aspectRatio: `${SAFARI_WIDTH}/${SAFARI_HEIGHT}`,
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
          className="pointer-events-none absolute z-0 overflow-hidden"
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
          className="pointer-events-none absolute z-0 overflow-hidden"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
            borderRadius: "0 0 11px 11px",
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
          className="absolute z-0 overflow-hidden [container-type:inline-size]"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
            borderRadius: "0 0 11px 11px",
          }}
        >
          {children}
        </div>
      )}

      <svg
        viewBox={`0 0 ${SAFARI_WIDTH} ${SAFARI_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 z-10 size-full"
        style={{ transform: "translateZ(0)" }}
        aria-hidden="true"
      >
        <defs>
          <mask id="safariPunch" maskUnits="userSpaceOnUse">
            <rect
              x="0"
              y="0"
              width={SAFARI_WIDTH}
              height={SAFARI_HEIGHT}
              fill="white"
            />
            <path
              d="M1 52H1201V741C1201 747.075 1196.08 752 1190 752H12C5.92486 752 1 747.075 1 741V52Z"
              fill="black"
            />
          </mask>

          <clipPath id="path0">
            <rect width={SAFARI_WIDTH} height={SAFARI_HEIGHT} fill="white" />
          </clipPath>
        </defs>

        <g
          clipPath="url(#path0)"
          mask={hasMedia || hasChildren ? "url(#safariPunch)" : undefined}
        >
          <path
            d="M0 52H1202V741C1202 747.627 1196.63 753 1190 753H12C5.37258 753 0 747.627 0 741V52Z"
            className="fill-[#E5E5E5] dark:fill-[#404040]"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 12C0 5.37258 5.37258 0 12 0H1190C1196.63 0 1202 5.37258 1202 12V52H0L0 12Z"
            className="fill-[#E5E5E5] dark:fill-[#404040]"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.06738 12C1.06738 5.92487 5.99225 1 12.0674 1H1189.93C1196.01 1 1200.93 5.92487 1200.93 12V51H1.06738V12Z"
            className="fill-white dark:fill-[#262626]"
          />
          <circle
            cx="27"
            cy="25"
            r="6"
            className="fill-[#FF5F57]"
          />
          <circle
            cx="47"
            cy="25"
            r="6"
            className="fill-[#FFBD2E]"
          />
          <circle
            cx="67"
            cy="25"
            r="6"
            className="fill-[#28C840]"
          />
          <path
            d="M286 17C286 13.6863 288.686 11 292 11H946C949.314 11 952 13.6863 952 17V35C952 38.3137 949.314 41 946 41H292C288.686 41 286 38.3137 286 35V17Z"
            className="fill-[#E5E5E5] dark:fill-[#404040]"
          />

          <g className="mix-blend-luminosity">
            <path
              d="M566.269 32.0852H572.426C573.277 32.0852 573.696 31.6663 573.696 30.7395V25.9851C573.696 25.1472 573.353 24.7219 572.642 24.6521V23.0842C572.642 20.6721 571.036 19.5105 569.348 19.5105C567.659 19.5105 566.053 20.6721 566.053 23.0842V24.6711C565.393 24.7727 565 25.1917 565 25.9851V30.7395C565 31.6663 565.418 32.0852 566.269 32.0852ZM567.272 22.97C567.272 21.491 568.211 20.6785 569.348 20.6785C570.478 20.6785 571.423 21.491 571.423 22.97V24.6394L567.272 24.6458V22.97Z"
              fill="#A3A3A3"
            />
          </g>

          <g className="mix-blend-luminosity">
            <text
              x="580"
              y="30"
              fill="#A3A3A3"
              fontSize="12"
              fontFamily="Arial, sans-serif"
            >
              {url}
            </text>
          </g>

          {mode === "default" ? (
            <>
              <g className="mix-blend-luminosity">
                <path
                  d="M99.5703 33.6016H112.938C114.633 33.6016 115.516 32.7266 115.516 31.0547V21.5469C115.516 19.875 114.633 19 112.938 19H99.5703C97.8828 19 97 19.8672 97 21.5469V31.0547C97 32.7266 97.8828 33.6016 99.5703 33.6016ZM99.6719 32.0469C98.9531 32.0469 98.5547 31.6719 98.5547 30.9141V21.6875C98.5547 20.9297 98.9531 20.5547 99.6719 20.5547H103.234V32.0469H99.6719ZM112.836 20.5547C113.555 20.5547 113.953 20.9297 113.953 21.6875V30.9141C113.953 31.6719 113.555 32.0469 112.836 32.0469H104.711V20.5547H112.836Z"
                  fill="#A3A3A3"
                />
              </g>
              <g className="mix-blend-luminosity">
                <path
                  d="M143.914 32.5938C144.094 32.7656 144.312 32.8594 144.562 32.8594C145.086 32.8594 145.492 32.4531 145.492 31.9375C145.492 31.6797 145.391 31.4453 145.211 31.2656L139.742 25.9219L145.211 20.5938C145.391 20.4141 145.492 20.1719 145.492 19.9219C145.492 19.4062 145.086 19 144.562 19C144.312 19 144.094 19.0938 143.922 19.2656L137.844 25.2031C137.625 25.4062 137.516 25.6562 137.516 25.9297C137.516 26.2031 137.625 26.4375 137.836 26.6484L143.914 32.5938Z"
                  fill="#A3A3A3"
                />
              </g>
              <g className="mix-blend-luminosity">
                <path
                  d="M168.422 32.8594C168.68 32.8594 168.891 32.7656 169.07 32.5938L175.148 26.6562C175.359 26.4375 175.469 26.2109 175.469 25.9297C175.469 25.6562 175.367 25.4141 175.148 25.2109L169.07 19.2656C168.891 19.0938 168.68 19 168.422 19C167.898 19 167.492 19.4062 167.492 19.9219C167.492 20.1719 167.602 20.4141 167.773 20.5938L173.25 25.9375L167.773 31.2656C167.594 31.4531 167.492 31.6797 167.492 31.9375C167.492 32.4531 167.898 32.8594 168.422 32.8594Z"
                  fill="#A3A3A3"
                />
              </g>
              <g className="mix-blend-luminosity">
                <path
                  d="M936.273 24.9766C936.5 24.9766 936.68 24.9062 936.82 24.7578L940.023 21.5312C940.195 21.3594 940.273 21.1719 940.273 20.9531C940.273 20.7422 940.188 20.5391 940.023 20.3828L936.82 17.125C936.68 16.9688 936.5 16.8906 936.273 16.8906C935.852 16.8906 935.516 17.2422 935.516 17.6719C935.516 17.8828 935.594 18.0547 935.727 18.2031L937.594 20.0312C937.227 19.9766 936.852 19.9453 936.477 19.9453C932.609 19.9453 929.516 23.0391 929.516 26.9141C929.516 30.7891 932.633 33.9062 936.5 33.9062C940.375 33.9062 943.484 30.7891 943.484 26.9141C943.484 26.4453 943.156 26.1094 942.688 26.1094C942.234 26.1094 941.93 26.4453 941.93 26.9141C941.93 29.9297 939.516 32.3516 936.5 32.3516C933.492 32.3516 931.07 29.9297 931.07 26.9141C931.07 23.875 933.469 21.4688 936.477 21.4688C936.984 21.4688 937.453 21.5078 937.867 21.5781L935.734 23.6875C935.594 23.8281 935.516 24 935.516 24.2109C935.516 24.6406 935.852 24.9766 936.273 24.9766Z"
                  fill="#A3A3A3"
                />
              </g>
              <g className="mix-blend-luminosity">
                <path
                  d="M1099.51 28.4141C1099.91 28.4141 1100.24 28.0859 1100.24 27.6953V19.8359L1100.18 18.6797L1100.66 19.25L1101.75 20.4141C1101.88 20.5547 1102.06 20.625 1102.24 20.625C1102.6 20.625 1102.9 20.3672 1102.9 20C1102.9 19.8047 1102.82 19.6641 1102.69 19.5312L1100.06 17.0078C1099.88 16.8203 1099.7 16.7578 1099.51 16.7578C1099.32 16.7578 1099.14 16.8203 1098.95 17.0078L1096.33 19.5312C1096.2 19.6641 1096.12 19.8047 1096.12 20C1096.12 20.3672 1096.41 20.625 1096.77 20.625C1096.95 20.625 1097.14 20.5547 1097.27 20.4141L1098.35 19.25L1098.84 18.6719L1098.78 19.8359V27.6953C1098.78 28.0859 1099.11 28.4141 1099.51 28.4141Z"
                  fill="#A3A3A3"
                />
              </g>
              <g className="mix-blend-luminosity">
                <path
                  d="M1134 33.0156C1134.49 33.0156 1134.89 32.6094 1134.89 32.1484V27.2578H1139.66C1140.13 27.2578 1140.54 26.8594 1140.54 26.3672C1140.54 25.8828 1140.13 25.4766 1139.66 25.4766H1134.89V20.5859C1134.89 20.1172 1134.49 19.7188 1134 19.7188C1133.52 19.7188 1133.11 20.1172 1133.11 20.5859V25.4766H1128.34C1127.88 25.4766 1127.46 25.8828 1127.46 26.3672C1127.46 26.8594 1127.88 27.2578 1128.34 27.2578H1133.11V32.1484C1133.11 32.6094 1133.52 33.0156 1134 33.0156Z"
                  fill="#A3A3A3"
                />
              </g>
            </>
          ) : null}
        </g>
      </svg>
    </div>
  );
}