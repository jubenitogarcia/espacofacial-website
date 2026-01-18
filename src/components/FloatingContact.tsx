"use client";

import { useCurrentUnit } from "@/hooks/useCurrentUnit";
import { trackEvent } from "@/lib/analytics";

export default function FloatingContact() {
  const unit = useCurrentUnit();
  const href = unit?.contactUrl;
  if (!href) return null;

  return (
    <a
      className="fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Agendar"
      onClick={() => trackEvent("cta_agendar_click", { placement: "floating", unitSlug: unit?.slug ?? null })}
    >
      💬 <span>Agendar</span>
    </a>
  );
}
