"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentUnit } from "@/hooks/useCurrentUnit";
import { doctorSlugFromTeamMember } from "@/lib/doctorSlug";
import { trackBookingStart, trackDoctorInstagramClick } from "@/lib/leadTracking";
import UnitQuickButtons from "@/components/UnitQuickButtons";

type TeamMember = {
    name: string;
    nickname: string | null;
    units: string[];
    role: string;
    roles: string[];
    instagramHandle: string | null;
    instagramUrl: string | null;
};

type InstagramMedia = {
    id: string;
    code: string | null;
    mediaType: "image" | "video" | "carousel";
    isReel: boolean;
    caption: string | null;
    takenAtMs: number | null;
    thumbnailUrl: string;
    videoUrl: string | null;
};

type InstagramFeedResponse =
    | {
          ok: true;
          user: { id: string; handle: string; name: string | null; bio: string | null };
          items: InstagramMedia[];
          hasMore: boolean;
          nextCursor: string | null;
      }
    | { ok: false; error: string };

async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchInstagramFeed(params: {
    handle: string;
    userId?: string | null;
    cursor?: string | null;
    attempts?: number;
}): Promise<InstagramFeedResponse | null> {
    const attempts = Math.max(1, params.attempts ?? 3);
    for (let i = 0; i < attempts; i++) {
        try {
            const qs = new URLSearchParams({ handle: params.handle });
            if (params.userId) qs.set("userId", params.userId);
            if (params.cursor) qs.set("cursor", params.cursor);
            const res = await fetch(`/api/instagram-feed?${qs.toString()}`, { cache: "no-store" });
            const json = (await res.json().catch(() => null)) as InstagramFeedResponse | null;
            if (json && json.ok) return json;

            if (i < attempts - 1) {
                await sleep(250 * (i + 1));
                continue;
            }
            return json;
        } catch {
            if (i < attempts - 1) {
                await sleep(250 * (i + 1));
                continue;
            }
            return null;
        }
    }
    return null;
}

function instagramIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6Zm5.25-.9a1.15 1.15 0 1 1 0 2.3a1.15 1.15 0 0 1 0-2.3Z"
            />
        </svg>
    );
}

function bookingIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 6H4.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5Z"
            />
        </svg>
    );
}

function unitLabelFromSlug(slug: string | null | undefined): string | null {
    if (!slug) return null;
    if (slug === "barrashoppingsul") return "BarraShoppingSul";
    if (slug === "novo-hamburgo") return "Novo Hamburgo";
    return null;
}

function avatarUrl(handle: string, name: string) {
    const h = encodeURIComponent(handle);
    const n = encodeURIComponent(name);
    return `/api/instagram-avatar?handle=${h}&name=${n}`;
}

function extractInstagramHandle(url: string | null): string | null {
    if (!url) return null;
    try {
        const { pathname } = new URL(url);
        const handle = pathname.split("/").filter(Boolean)[0];
        return handle ? handle.replace(/^@/, "") : null;
    } catch {
        return null;
    }
}

export default function UnitDoctorsGrid() {
    const unit = useCurrentUnit();
    const unitLabel = unitLabelFromSlug(unit?.slug);

    const [members, setMembers] = useState<TeamMember[] | null>(null);
    const [membersError, setMembersError] = useState<string | null>(null);
    const [activeInstagram, setActiveInstagram] = useState<{
        name: string;
        handle: string;
    } | null>(null);
    const [instagramItems, setInstagramItems] = useState<InstagramMedia[]>([]);
    const [instagramUserId, setInstagramUserId] = useState<string | null>(null);
    const [instagramNextCursor, setInstagramNextCursor] = useState<string | null>(null);
    const [instagramHasMore, setInstagramHasMore] = useState(false);
    const [instagramLoading, setInstagramLoading] = useState(false);
    const [instagramLoadingMore, setInstagramLoadingMore] = useState(false);
    const [instagramError, setInstagramError] = useState<string | null>(null);
    const [activeInstagramMediaId, setActiveInstagramMediaId] = useState<string | null>(null);
    const [instagramReloadToken, setInstagramReloadToken] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/api/equipe", { cache: "no-store" });
                const json = (await res.json().catch(() => null)) as
                    | { ok?: boolean; members?: TeamMember[]; error?: { code?: string; status?: number } }
                    | null;
                if (cancelled) return;
                const nextMembers = Array.isArray(json?.members) ? json!.members! : [];
                setMembers(nextMembers);
                setMembersError(json && json.ok === false ? json.error?.code ?? "unknown" : null);
            } catch {
                if (cancelled) return;
                setMembers([]);
                setMembersError("exception");
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!activeInstagram) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key !== "Escape") return;
            if (activeInstagramMediaId) {
                setActiveInstagramMediaId(null);
                return;
            }
            setActiveInstagram(null);
        }

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [activeInstagram, activeInstagramMediaId]);

    const filtered = useMemo(() => {
        if (!members) return null;
        if (!unitLabel) return [];

        return members.filter((m) => m.units.map((u) => u.toLowerCase()).includes(unitLabel.toLowerCase()));
    }, [members, unitLabel]);

    useEffect(() => {
        if (!activeInstagram) return;
        const currentInstagram = activeInstagram;
        let cancelled = false;

        async function loadInstagramFeed() {
            setInstagramLoading(true);
            setInstagramLoadingMore(false);
            setInstagramError(null);
            setInstagramItems([]);
            setInstagramUserId(null);
            setInstagramNextCursor(null);
            setInstagramHasMore(false);
            setActiveInstagramMediaId(null);

            try {
                const json = await fetchInstagramFeed({ handle: currentInstagram.handle, attempts: 3 });
                if (cancelled) return;
                if (!json || !json.ok) {
                    setInstagramError("Não foi possível carregar as publicações agora.");
                    return;
                }

                setInstagramItems(Array.isArray(json.items) ? json.items : []);
                setInstagramUserId(json.user?.id || null);
                setInstagramNextCursor(json.nextCursor ?? null);
                setInstagramHasMore(Boolean(json.hasMore && json.nextCursor));
            } catch {
                if (cancelled) return;
                setInstagramError("Falha de rede ao carregar publicações.");
            } finally {
                if (!cancelled) setInstagramLoading(false);
            }
        }

        loadInstagramFeed();
        return () => {
            cancelled = true;
        };
    }, [activeInstagram, instagramReloadToken]);

    const activeInstagramMediaIndex = useMemo(() => {
        if (!activeInstagramMediaId) return -1;
        return instagramItems.findIndex((item) => item.id === activeInstagramMediaId);
    }, [activeInstagramMediaId, instagramItems]);

    const activeInstagramMedia = useMemo(() => {
        if (activeInstagramMediaIndex < 0) return null;
        return instagramItems[activeInstagramMediaIndex] ?? null;
    }, [activeInstagramMediaIndex, instagramItems]);

    const hasPrevInstagramMedia = activeInstagramMediaIndex > 0;
    const hasNextInstagramMedia = activeInstagramMediaIndex >= 0 && activeInstagramMediaIndex < instagramItems.length - 1;

    async function loadMoreInstagram() {
        if (!activeInstagram || !instagramUserId || !instagramNextCursor || instagramLoadingMore) return;

        setInstagramLoadingMore(true);
        setInstagramError(null);
        try {
            const json = await fetchInstagramFeed({
                handle: activeInstagram.handle,
                userId: instagramUserId,
                cursor: instagramNextCursor,
                attempts: 3,
            });
            if (!json || !json.ok) {
                setInstagramError("Não foi possível carregar mais publicações.");
                return;
            }

            setInstagramItems((prev) => {
                const seen = new Set(prev.map((item) => item.id));
                const nextItems = json.items.filter((item) => !seen.has(item.id));
                return [...prev, ...nextItems];
            });
            setInstagramNextCursor(json.nextCursor ?? null);
            setInstagramHasMore(Boolean(json.hasMore && json.nextCursor));
        } catch {
            setInstagramError("Falha de rede ao carregar mais publicações.");
        } finally {
            setInstagramLoadingMore(false);
        }
    }

    if (!unitLabel) {
        return (
            <>
                <p className="sectionSub">Selecione a unidade para conhecer nossos doutores.</p>
                <UnitQuickButtons placement="doctors_quick" />
            </>
        );
    }

    const selectedUnitSubtitle = <p className="sectionSub">Conheça nossos doutores, veja seus perfis e procedimentos realizados.</p>;

    if (filtered === null) {
        return (
            <>
                {selectedUnitSubtitle}
                <div className="card">Carregando equipe…</div>
            </>
        );
    }

    if (filtered.length === 0) {
        return (
            <>
                {selectedUnitSubtitle}
                <div className="card">
                    {membersError ? "Não foi possível carregar a equipe no momento." : `Nenhum doutor encontrado para ${unitLabel}.`}
                </div>
            </>
        );
    }

    return (
        <>
            {selectedUnitSubtitle}
            <div className="grid">
                {filtered.map((d) => {
                    const fullName = d.name;
                    const nickname = d.nickname;
                    const handle = d.instagramHandle;
                    const href = d.instagramUrl;
                    const instagramHandle = handle || extractInstagramHandle(href);
                    const doctorSlug = doctorSlugFromTeamMember({ name: fullName, instagramHandle: handle });
                    const bookingHref = unit?.slug
                        ? `/agendamento?unit=${encodeURIComponent(unit.slug)}&doctor=${encodeURIComponent(doctorSlug)}`
                        : "/agendamento";
                    const openInstagram = () => {
                        if (!instagramHandle) return;
                        setActiveInstagram({ name: fullName, handle: instagramHandle });
                        trackDoctorInstagramClick({
                            unitSlug: unit?.slug ?? null,
                            doctorName: fullName,
                            instagramUrl: href ?? `https://www.instagram.com/${instagramHandle}/`,
                        });
                    };

                    return (
                        <article
                            key={`${fullName}-${href ?? "noinsta"}`}
                            className="card"
                            style={{ display: "block" }}
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                                {instagramHandle ? (
                                    <button
                                        className="doctorCardMainLink doctorCardMainButton"
                                        type="button"
                                        onClick={openInstagram}
                                        aria-label={`Abrir Instagram de ${fullName}`}
                                        title="Abrir Instagram"
                                    >
                                        <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", background: "white" }}>
                                            {handle ? (
                                                <Image src={avatarUrl(handle, nickname ?? fullName)} alt={nickname ?? fullName} width={56} height={56} unoptimized />
                                            ) : null}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName}</h3>
                                            <p style={{ margin: 0, color: "var(--muted)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {nickname || unitLabel}
                                            </p>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="doctorCardMainLink" aria-label={fullName}>
                                        <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", background: "white" }}>
                                            {handle ? (
                                                <Image src={avatarUrl(handle, nickname ?? fullName)} alt={nickname ?? fullName} width={56} height={56} unoptimized />
                                            ) : null}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName}</h3>
                                            <p style={{ margin: 0, color: "var(--muted)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {nickname || unitLabel}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                    {instagramHandle ? (
                                        <button
                                            className="iconBtn"
                                            type="button"
                                            onClick={openInstagram}
                                            aria-label="Instagram"
                                            title="Instagram"
                                        >
                                            {instagramIcon()}
                                        </button>
                                    ) : null}

                                    <Link
                                        className="iconBtn"
                                        href={bookingHref}
                                        onClick={() =>
                                            trackBookingStart({
                                                placement: "doctor_grid",
                                                unitSlug: unit?.slug ?? null,
                                                doctorName: fullName,
                                                bookingUrl: bookingHref,
                                            })
                                        }
                                        aria-label={`Agendar com ${fullName}`}
                                        title="Agendar"
                                    >
                                        {bookingIcon()}
                                    </Link>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {activeInstagram ? (
                <div
                    className="modalOverlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Instagram de ${activeInstagram.name}`}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setActiveInstagram(null);
                    }}
                >
                    <div className="modalCard instagramModalCard">
                        <div className="modalHeader">
                            <div>
                                <div className="modalTitle">{activeInstagram.name}</div>
                                <div className="modalSubtitle">@{activeInstagram.handle}</div>
                            </div>
                            <button className="modalClose" type="button" onClick={() => setActiveInstagram(null)} aria-label="Fechar">
                                ×
                            </button>
                        </div>
                        <div className="modalBody instagramModalBody">
                            {instagramLoading && instagramItems.length === 0 ? (
                                <div className="instagramFallback">
                                    Carregando publicações e reels…
                                </div>
                            ) : null}

                            {!instagramLoading && instagramItems.length === 0 ? (
                                <div className="instagramFallback">
                                    {instagramError ? "Não foi possível carregar o Instagram agora. Tente novamente em instantes." : "Nenhuma publicação visível neste perfil no momento."}
                                    {instagramError ? (
                                        <div className="modalActions">
                                            <button
                                                className="btn btnGhost instagramLoadMoreBtn"
                                                type="button"
                                                onClick={() => setInstagramReloadToken((v) => v + 1)}
                                                disabled={instagramLoading}
                                            >
                                                Tentar novamente
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {activeInstagramMedia ? (
                                <div className="instagramViewer">
                                    <div className="instagramViewerTop">
                                        <button className="btn btnGhost instagramViewerBack" type="button" onClick={() => setActiveInstagramMediaId(null)}>
                                            Voltar ao grid
                                        </button>
                                        <div className="instagramViewerNav">
                                            <button
                                                className="btn btnGhost instagramViewerStep"
                                                type="button"
                                                disabled={!hasPrevInstagramMedia}
                                                onClick={() => {
                                                    if (!hasPrevInstagramMedia) return;
                                                    setActiveInstagramMediaId(instagramItems[activeInstagramMediaIndex - 1]?.id ?? null);
                                                }}
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                className="btn btnGhost instagramViewerStep"
                                                type="button"
                                                disabled={!hasNextInstagramMedia}
                                                onClick={() => {
                                                    if (!hasNextInstagramMedia) return;
                                                    setActiveInstagramMediaId(instagramItems[activeInstagramMediaIndex + 1]?.id ?? null);
                                                }}
                                            >
                                                Próximo
                                            </button>
                                        </div>
                                    </div>

                                    <div className="instagramViewerMediaWrap">
                                        {activeInstagramMedia.mediaType === "video" && activeInstagramMedia.videoUrl ? (
                                            <video
                                                className="instagramViewerMedia"
                                                src={activeInstagramMedia.videoUrl}
                                                poster={activeInstagramMedia.thumbnailUrl}
                                                controls
                                                playsInline
                                                preload="metadata"
                                            />
                                        ) : (
                                            <img className="instagramViewerMedia" src={activeInstagramMedia.thumbnailUrl} alt={`Publicação de ${activeInstagram.name}`} loading="lazy" />
                                        )}
                                    </div>

                                    {activeInstagramMedia.caption ? <p className="instagramViewerCaption">{activeInstagramMedia.caption}</p> : null}
                                </div>
                            ) : null}

                            {instagramItems.length > 0 ? (
                                <div className="instagramGrid">
                                    {instagramItems.map((item) => {
                                        const label = item.isReel ? "Reel" : item.mediaType === "video" ? "Vídeo" : item.mediaType === "carousel" ? "Carrossel" : "Post";
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`instagramMediaBtn ${activeInstagramMediaId === item.id ? "instagramMediaBtn--active" : ""}`.trim()}
                                                onClick={() => setActiveInstagramMediaId(item.id)}
                                                aria-label={`Abrir ${label.toLowerCase()} de ${activeInstagram.name}`}
                                            >
                                                <img className="instagramMediaThumb" src={item.thumbnailUrl} alt={`Publicação de ${activeInstagram.name}`} loading="lazy" />
                                                {label !== "Post" ? <span className="instagramMediaBadge">{label}</span> : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null}

                            {instagramError && instagramItems.length > 0 ? (
                                <div className="instagramInlineError">
                                    {instagramError}
                                    <div className="modalActions">
                                        <button
                                            className="btn btnGhost instagramLoadMoreBtn"
                                            type="button"
                                            onClick={() => setInstagramReloadToken((v) => v + 1)}
                                            disabled={instagramLoading}
                                        >
                                            Recarregar feed
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {instagramHasMore ? (
                                <div className="modalActions">
                                    <button className="btn btnGhost instagramLoadMoreBtn" type="button" onClick={loadMoreInstagram} disabled={instagramLoadingMore}>
                                        {instagramLoadingMore ? "Carregando…" : "Carregar mais"}
                                    </button>
                                </div>
                            ) : null}
                            <div className="modalNote">Posts e reels são exibidos dentro desta janela para manter você no site.</div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
