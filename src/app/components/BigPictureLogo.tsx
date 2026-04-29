import { useState } from "react";
import svgFallback from "../../imports/bigpicture-logo.svg?url";

type Props = {
  className?: string;
};

export function BigPictureLogo({ className }: Props) {
  const rasterSrc = `${import.meta.env.BASE_URL}bigpicture-logo.png`;
  const [logoSrc, setLogoSrc] = useState(rasterSrc);

  return (
    <div className={className}>
      <img
        src={logoSrc}
        alt="BigPicture"
        className="h-10 w-auto max-w-full object-contain object-left"
        decoding="async"
        onError={() => {
          setLogoSrc((prev) => (prev === svgFallback ? prev : svgFallback));
        }}
      />
    </div>
  );
}
