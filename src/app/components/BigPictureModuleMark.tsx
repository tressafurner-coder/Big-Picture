import { useId } from "react";

type Props = {
  className?: string;
  /** Pixel height; width follows 16:18 aspect ratio. */
  height?: number;
};

/**
 * BigPicture module mark (geometric logo) — inline SVG with gradients.
 * IDs are scoped with React useId() so multiple instances do not clash.
 */
export function BigPictureModuleMark({
  className,
  height = 32,
}: Props) {
  const raw = useId().replace(/:/g, "");
  const p0 = `${raw}-g0`;
  const p1 = `${raw}-g1`;
  const p2 = `${raw}-g2`;
  const p3 = `${raw}-g3`;
  const p4 = `${raw}-g4`;
  const p5 = `${raw}-g5`;
  const p6 = `${raw}-g6`;
  const w = Math.round((height * 16) / 18);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={height}
      viewBox="0 0 16 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12.0285 7.15685C12.0151 7.02032 11.9737 6.88803 11.9067 6.76828C11.8398 6.64852 11.7489 6.54389 11.6396 6.46094L8.01062 8.5465C7.99371 8.55634 7.9745 8.56152 7.95494 8.56152C7.93538 8.56152 7.91618 8.55634 7.89927 8.5465L4.35224 6.47159C4.23608 6.55305 4.14164 6.66173 4.07719 6.78813C4.01274 6.91452 3.98024 7.05479 3.98254 7.19665V7.27472L7.45323 9.32332C7.60604 9.41081 7.77907 9.45684 7.95516 9.45684C8.13125 9.45684 8.30428 9.41081 8.45709 9.32332L12.0302 7.26842L12.0285 7.15685Z"
        fill={`url(#${p0})`}
      />
      <path
        d="M7.11317 13.0975L4.39973 11.5317C4.29633 11.4719 4.20765 11.3897 4.14024 11.2911C4.07284 11.1924 4.02841 11.08 4.01023 10.9619C4.00284 11.1474 3.99805 11.3338 3.99805 11.521C3.99654 13.2002 4.30067 14.8657 4.89557 16.4359L7.19864 17.7664C7.44191 17.9068 7.71785 17.9807 7.99873 17.9807C8.27962 17.9807 8.55555 17.9068 8.79883 17.7664L13.3345 15.1494C11.126 14.9753 8.99192 14.2715 7.11317 13.0975Z"
        fill={`url(#${p1})`}
      />
      <path
        d="M11.3422 11.6798L8.40037 13.3782C8.29535 13.451 8.17262 13.4942 8.04513 13.5031C7.91764 13.512 7.7901 13.4864 7.67596 13.4289C7.67227 13.4269 7.72598 13.4585 7.76295 13.4787C9.48027 14.4258 11.38 14.9953 13.3351 15.1491L15.2006 14.0722C15.4439 13.9317 15.6458 13.7297 15.7863 13.4865C15.9267 13.2432 16.0007 12.9673 16.0007 12.6864V7.58105C14.7757 9.28014 13.1834 10.6811 11.3422 11.6798Z"
        fill={`url(#${p2})`}
      />
      <path
        d="M4.35712 6.47862C4.37126 6.46927 7.59968 4.6027 7.59968 4.6027C7.70019 4.54492 7.81207 4.50972 7.92756 4.49954C8.04304 4.48937 8.15936 4.50445 8.26842 4.54376C6.6997 3.54649 4.94545 2.87687 3.1112 2.5752L0.79944 3.90983C0.556324 4.05037 0.354468 4.2524 0.214142 4.49564C0.0738173 4.73888 -3.58959e-05 5.01475 1.30885e-08 5.29556V10.2252C1.17625 8.68717 2.66018 7.41116 4.35712 6.47862Z"
        fill={`url(#${p3})`}
      />
      <path
        d="M3.99785 11.5202C3.99785 11.3329 4.00264 11.1466 4.01003 10.9611C4.00372 10.9206 3.99959 7.1429 3.99959 7.1429C3.99979 7.01126 4.03254 6.88172 4.09492 6.76581C4.1573 6.64989 4.24737 6.5512 4.35712 6.47852C2.66018 7.41106 1.17625 8.68707 0 10.2251V12.6856C3.02394e-05 12.9665 0.073982 13.2424 0.214425 13.4857C0.354868 13.7289 0.556855 13.9309 0.800093 14.0714L4.89537 16.4362C4.30034 14.8656 3.99621 13.1997 3.99785 11.5202Z"
        fill={`url(#${p4})`}
      />
      <path
        d="M15.2001 3.90997L10.9902 1.47949C11.6591 3.13222 12.002 4.89872 12 6.68166V10.8384C12.0005 10.9785 11.9645 11.1163 11.8954 11.2381C11.8264 11.36 11.7268 11.4617 11.6063 11.5333C13.3366 10.5453 14.8349 9.19773 16.0002 7.58157V5.29571C16.0002 5.01483 15.9262 4.73891 15.7858 4.49567C15.6453 4.25242 15.4434 4.05043 15.2001 3.90997Z"
        fill={`url(#${p5})`}
      />
      <path
        d="M8.26854 4.54333C8.31334 4.55942 11.5998 6.45014 11.5998 6.45014C11.7093 6.51359 11.8022 6.60213 11.8709 6.70849C11.9395 6.81484 11.9819 6.93596 11.9946 7.06189C11.9978 6.93532 11.9998 6.80853 11.9998 6.68131C12.0018 4.89829 11.6589 3.13172 10.99 1.47892L8.79984 0.214314C8.55656 0.073913 8.28063 0 7.99974 0C7.71886 0 7.44292 0.073913 7.19965 0.214314L3.11133 2.57477C4.94557 2.87644 6.69983 3.54606 8.26854 4.54333Z"
        fill={`url(#${p6})`}
      />
      <defs>
        <linearGradient
          id={p0}
          x1="8.00632"
          y1="6.41001"
          x2="8.00632"
          y2="9.32502"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007FBF" />
          <stop offset="0.847" stopColor="#02A3F3" />
          <stop offset="1" stopColor="#03AAFE" />
        </linearGradient>
        <linearGradient
          id={p1}
          x1="4.28748"
          y1="12.5622"
          x2="8.76567"
          y2="17.8706"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007FBF" />
          <stop offset="0.847" stopColor="#02A3F3" />
          <stop offset="1" stopColor="#03AAFE" />
        </linearGradient>
        <linearGradient
          id={p2}
          x1="10.5312"
          y1="14.4756"
          x2="15.3718"
          y2="9.84798"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007FBF" />
          <stop offset="0.847" stopColor="#02A3F3" />
          <stop offset="1" stopColor="#03AAFE" />
        </linearGradient>
        <linearGradient
          id={p3}
          x1="6.25919"
          y1="2.95005"
          x2="-0.106206"
          y2="8.42043"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007FBF" />
          <stop offset="0.847" stopColor="#02A3F3" />
          <stop offset="1" stopColor="#03AAFE" />
        </linearGradient>
        <linearGradient
          id={p4}
          x1="2.44769"
          y1="8.00204"
          x2="2.44769"
          y2="14.7035"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007FBF" />
          <stop offset="0.847" stopColor="#02A3F3" />
          <stop offset="1" stopColor="#03AAFE" />
        </linearGradient>
        <linearGradient
          id={p5}
          x1="13.4952"
          y1="10.1056"
          x2="13.4952"
          y2="3.01772"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007FBF" />
          <stop offset="0.847" stopColor="#02A3F3" />
          <stop offset="1" stopColor="#03AAFE" />
        </linearGradient>
        <linearGradient
          id={p6}
          x1="11.742"
          y1="4.59023"
          x2="6.76892"
          y2="0.238733"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007FBF" />
          <stop offset="0.847" stopColor="#02A3F3" />
          <stop offset="1" stopColor="#03AAFE" />
        </linearGradient>
      </defs>
    </svg>
  );
}
