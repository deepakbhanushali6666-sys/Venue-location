import w320jpg from "@/assets/deepak-bhanushali-320.jpg.asset.json";
import w640jpg from "@/assets/deepak-bhanushali-640.jpg.asset.json";
import w960jpg from "@/assets/deepak-bhanushali-960.jpg.asset.json";
import w320webp from "@/assets/deepak-bhanushali-320.webp.asset.json";
import w640webp from "@/assets/deepak-bhanushali-640.webp.asset.json";
import w960webp from "@/assets/deepak-bhanushali-960.webp.asset.json";

const webpSet = `${w320webp.url} 320w, ${w640webp.url} 640w, ${w960webp.url} 960w`;
const jpgSet = `${w320jpg.url} 320w, ${w640jpg.url} 640w, ${w960jpg.url} 960w`;

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
      />
    </picture>
  );
}
