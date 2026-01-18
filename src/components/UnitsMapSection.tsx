"use client";

import Link from "next/link";
import { units } from "@/data/units";
import { trackEvent } from "@/lib/analytics";

type ProjectedPoint = {
  x: number;
  y: number;
};

function projectLatLngToBrazilSvg(lat: number, lng: number): ProjectedPoint {
  // Approximate bounds for Brazil (equirectangular projection)
  const minLng = -74;
  const maxLng = -34;
  const minLat = -34;
  const maxLat = 6;

  const nx = (lng - minLng) / (maxLng - minLng);
  const ny = (maxLat - lat) / (maxLat - minLat);

  // Place points inside our stylized silhouette area (viewBox 0..1000)
  const x = 180 + nx * 640;
  const y = 120 + ny * 780;

  return {
    x: Math.max(0, Math.min(1000, x)),
    y: Math.max(0, Math.min(1000, y)),
  };
}

export default function UnitsMapSection() {
  const mappableUnits = units.filter((u) => typeof u.lat === "number" && typeof u.lng === "number");

  return (
    <div className="unitsMapLayout">
      <div className="brMap" aria-label="Mapa do Brasil com unidades">
        <svg viewBox="0 0 1000 1000" role="img" aria-label="Brasil">
          <path
            d="M220 110 L650 130 L820 250 L880 470 L770 860 L470 930 L260 780 L160 520 L180 280 Z"
            fill="#f6f6f6"
            stroke="rgba(0,0,0,.10)"
            strokeWidth="10"
            strokeLinejoin="round"
          />

          {mappableUnits.map((u) => {
            const p = projectLatLngToBrazilSvg(u.lat as number, u.lng as number);
            return (
              <g key={u.slug}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={12}
                  fill="#111111"
                  opacity={0.9}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    trackEvent("unit_map_click", { unitSlug: u.slug, placement: "map" });
                    // Navigate via unit "site" URL; the route itself redirects to the Home anchor.
                    window.location.href = `/unidades/${u.slug}`;
                  }}
                />
                <circle cx={p.x} cy={p.y} r={22} fill="transparent" style={{ cursor: "pointer" }} />
              </g>
            );
          })}
        </svg>
        <div className="brMapHint">Clique em um ponto para abrir a unidade</div>
      </div>

      <div className="unitsList" aria-label="Lista de unidades">
        <div className="unitsListTitle">Unidades</div>
        <div className="unitsListItems">
          {units.map((u) => (
            <Link
              key={u.slug}
              href={`/unidades/${u.slug}`}
              className="unitsListItem"
              onClick={() => trackEvent("unit_map_click", { unitSlug: u.slug, placement: "list" })}
            >
              <div className="unitsListName">{u.name}</div>
              {u.addressLine ? <div className="unitsListAddr">{u.addressLine}</div> : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
