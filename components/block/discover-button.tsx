"use client";

import { ArrowRight } from "lucide-react";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import "./discover-button.css";

/**
 * Pill button with an expanding fill on hover/focus.
 *
 * Adapted from the "Discover Button" block of ObsidianUI
 * (https://www.obsidianui.dev, MIT licensed — see NOTICE-obsidianui.md).
 * Kept as a client component because the original relies on hover/focus
 * CSS state only, so it stays a thin presentational wrapper here.
 */
export interface DiscoverButtonProps {
  label?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function DiscoverButton({
  label = "Discover Components",
  href,
  onClick,
  className,
}: DiscoverButtonProps) {
  const buttonFace = (
    <>
      <span className="obsidian-discover-button__fill" aria-hidden="true" />
      <span className="obsidian-discover-button__icon" aria-hidden="true">
        <ArrowRight size={25} strokeWidth={2.25} />
      </span>
      <span className="obsidian-discover-button__text">{label}</span>
    </>
  );

  if (href) {
    return (
      <a className={cn("obsidian-discover-button", className)} href={href}>
        {buttonFace}
      </a>
    );
  }

  return (
    <button
      className={cn("obsidian-discover-button", className)}
      type="button"
      onClick={onClick}
    >
      {buttonFace}
    </button>
  );
}

export default DiscoverButton;
