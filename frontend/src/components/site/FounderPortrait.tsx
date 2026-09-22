import w320jpg from "@/assets/deepak-bhanushali-320.jpg.asset.json";
import w640jpg from "@/assets/deepak-bhanushali-640.jpg.asset.json";
import w960jpg from "@/assets/deepak-bhanushali-960.jpg.asset.json";
import w320webp from "@/assets/deepak-bhanushali-320.webp.asset.json";
import w640webp from "@/assets/deepak-bhanushali-640.webp.asset.json";
import w960webp from "@/assets/deepak-bhanushali-960.webp.asset.json";

const webpSet = `${w320webp.url} 320w, ${w640webp.url} 640w, ${w960webp.url} 960w`;
const jpgSet = `${w320jpg.url} 320w, ${w640jpg.url} 640w, ${w960jpg.url} 960w`;

// SVG placeholder shown if the Lovable-hosted portrait URL fails to resolve.
const FALLBACK_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1a2a4a"/>
          <stop offset="1" stop-color="#0b1730"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <circle cx="200" cy="160" r="70" fill="#e0b96a"/>
      <path d="M60 400 C60 300 140 250 200 250 C260 250 340 300 340 400 Z" fill="#e0b96a"/>
      <text x="200" y="380" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#0b1730">DEEPAK BHANUSHALI</text>
    </svg>`,
  );

type Props = {
  /** Descriptive alternative text for this specific placement. */
  alt: string;
  /** CSS `sizes` hint so the browser picks the smallest useful variant. */
  sizes: string;
  className?: string;
  /** Set on the largest above-the-fold placement only. */
  priority?: boolean;
  width?: number;
  height?: number;
};

export function FounderPortrait({ alt, sizes, className, priority = false, width = 960, height = 960 }: Props) {
  return (
    <picture>
      <source type="image/webp" srcSet={webpSet} sizes={sizes} />
      <img
        src={w640jpg.url}
        srcSet={jpgSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={className}
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src !== FALLBACK_SRC) {
            img.srcset = "";
            img.src = FALLBACK_SRC;
          }
        }}
      />
    </picture>
  );
}
