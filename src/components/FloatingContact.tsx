"use client";

import { useCurrentUnit } from "@/hooks/useCurrentUnit";

export default function FloatingContact() {
  const unit = useCurrentUnit();
  const href = unit?.contactUrl;
  if (!href) return null;

  return (
    <a className="fab" href={href} target="_blank" rel="noopener noreferrer" aria-label="Agendar">
      💬 <span>Agendar</span>
    </a>
  );
}
