"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { units } from "@/data/units";
import { setStoredUnitSlug } from "@/lib/unitSelection";
import { trackEvent } from "@/lib/analytics";

export default function UnitFilter({ onSelect }: { onSelect?: (slug: string) => void } = {}) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return units;
    return units.filter((u) => (u.name + " " + (u.addressLine || "")).toLowerCase().includes(s));
  }, [q]);

  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Filtrar por Unidade</div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Selecionar Unidade"
        style={{
          width: "100%",
          padding: "12px 12px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,.2)",
          background: "rgba(255,255,255,.08)",
          color: "white",
          outline: "none",
        }}
      />
      <div style={{ marginTop: 10, display: "grid", gap: 10, maxHeight: 260, overflow: "auto" }}>
        {filtered.slice(0, 30).map((u) => (
          <button
            key={u.slug}
            onClick={() => {
              setStoredUnitSlug(u.slug);
              trackEvent("unit_select", { unitSlug: u.slug, placement: "unit_filter" });
              if (onSelect) {
                onSelect(u.slug);
                return;
              }
              router.push(`/unidades/${u.slug}`);
            }}
            style={{
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(255,255,255,.06)",
              color: "white",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 14 }}>{u.name}</div>
            {u.addressLine ? <div style={{ opacity: 0.8, fontSize: 12 }}>{u.addressLine}</div> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
