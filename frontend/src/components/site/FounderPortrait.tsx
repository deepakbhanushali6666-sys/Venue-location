import portrait from "@/assets/deepak-bhanushali-portrait.jpg";

type Props = {
  /** Descriptive alternative text for this specific placement. */
  alt: string;
  /** Unused now that the portrait is a single bundled local asset (kept for caller compatibility). */
  sizes?: string;
  className?: string;
  /** Set on the largest above-the-fold placement only. */
  priority?: boolean;
  width?: number;
  height?: number;
};

export function FounderPortrait({ alt, className, priority = false, width = 960, height = 960 }: Props) {
  return (
    <img
      src={portrait}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}

