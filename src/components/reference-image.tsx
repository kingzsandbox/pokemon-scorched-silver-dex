"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type ReferenceImageProps = {
  src: string | null;
  fallbackSrc?: string | null;
  alt: string;
  width: number;
  height: number;
  style?: CSSProperties;
  normalizeVisual?: boolean;
  visualScaleHint?: number;
};

export default function ReferenceImage({
  src,
  fallbackSrc = null,
  alt,
  width,
  height,
  style,
  normalizeVisual = false,
  visualScaleHint = 1,
}: ReferenceImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src ?? fallbackSrc ?? "");
  const [visualScale, setVisualScale] = useState(visualScaleHint);
  const shouldRequestCors = normalizeVisual && currentSrc
    ? !currentSrc.includes("play.pokemonshowdown.com")
    : false;

  useEffect(() => {
    setCurrentSrc(src ?? fallbackSrc ?? "");
    setVisualScale(visualScaleHint);
  }, [src, fallbackSrc, visualScaleHint]);

  function normalizeSpriteOccupancy(image: HTMLImageElement) {
    if (!normalizeVisual || !image.naturalWidth || !image.naturalHeight) {
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        return;
      }

      context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha > 16) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        return;
      }

      const occupiedWidth = maxX - minX + 1;
      const occupiedHeight = maxY - minY + 1;
      const targetOccupancy = Math.min(width, height) * 0.86;
      const scale = Math.min(targetOccupancy / occupiedWidth, targetOccupancy / occupiedHeight);
      setVisualScale(Math.max(1, Math.min(1.7, scale)));
    } catch {
      setVisualScale(visualScaleHint);
    }
  }

  return currentSrc ? (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      crossOrigin={shouldRequestCors ? "anonymous" : undefined}
      loading="lazy"
      onLoad={(event) => normalizeSpriteOccupancy(event.currentTarget)}
      onError={(event) => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          event.currentTarget.src = fallbackSrc;
          setCurrentSrc(fallbackSrc);
        } else {
          setCurrentSrc("");
        }
      }}
      style={{
        ...style,
        transform: normalizeVisual
          ? `${style?.transform ? `${style.transform} ` : ""}scale(${visualScale})`
          : style?.transform,
        transformOrigin: "center",
      }}
    />
  ) : (
    <span
      role="img"
      aria-label={alt}
      style={{
        width,
        height,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        border: "1px solid var(--border-soft)",
        background: "linear-gradient(180deg, var(--surface-card), var(--surface-muted))",
        color: "var(--text-muted)",
        fontSize: "0.75rem",
        fontWeight: 700,
        ...style,
      }}
    >
      —
    </span>
  );
}
