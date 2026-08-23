"use client";

import Image from "next/image";

/**
 * Renders the Brounic Group logo. Drop the real logo file at
 * /public/logo.png (transparent background recommended) — this component
 * will pick it up automatically. Until then it falls back to a text mark
 * so the layout doesn't break.
 */
export default function Logo({
  variant = "light",
  size = 32,
}: {
  variant?: "light" | "dark";
  size?: number;
}) {
  const chipPadding = Math.round(size * 0.15);

  return (
    <div className="flex items-center gap-2">
      <div
        className={
          variant === "dark"
            ? "relative shrink-0 rounded-md bg-white"
            : "relative shrink-0"
        }
        style={{
          width: size + (variant === "dark" ? chipPadding * 2 : 0),
          height: size + (variant === "dark" ? chipPadding * 2 : 0),
          padding: variant === "dark" ? chipPadding : 0,
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/logo.png"
            alt="Brounic Group | Fire and Safety"
            fill
            className="object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>
      <div className="leading-tight">
        <div
          className={`text-sm font-medium ${
            variant === "dark" ? "text-white" : "text-brounic-black"
          }`}
        >
          Brounic Group
        </div>
        <div
          className={`text-[11px] ${
            variant === "dark" ? "text-brounic-accent" : "text-brounic-orange"
          }`}
        >
          Fire and Safety
        </div>
      </div>
    </div>
  );
}
