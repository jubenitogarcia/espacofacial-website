"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type WheelEvent } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { units } from "@/data/units";
import { services, type Service } from "@/data/services";
import { useCurrentUnit } from "@/hooks/useCurrentUnit";
import { doctorSlugFromTeamMember, normalizeDoctorSlug } from "@/lib/doctorSlug";
import { setStoredUnitSlug } from "@/lib/unitSelection";
import TurnstileWidget from "@/components/TurnstileWidget";
import UnitChooser from "@/components/UnitChooser";

type TeamMember = {
    name: string;
    nickname: string | null;
    units: string[];
    role: string;
    roles: string[];
    instagramHandle: string | null;
    instagramUrl: string | null;
};

type SlotsPayload = {
    ok: true;
    unitSlug: string;
    doctorSlug: string;
    serviceId: string;
    durationMinutes: number;
    date: string;
    slots: Array<{ time: string; startAtMs: number; endAtMs: number; available: boolean; reason: string | null }>;
};

type NotificationResult = { ok: boolean; status: string; provider?: string; error?: string };

type RequestResponse =
    | { ok: true; id: string; status: string; confirmByMs: number; startAtMs: number; endAtMs: number; unitSlug: string; doctorSlug: string; doctorName: string; service: { id: string; name: string }; notifications?: { email: NotificationResult; whatsapp: NotificationResult } }
    | { ok: false; error: string; message?: string };

type BookingStatus = {
    id: string;
    status: string;
    unit_slug: string;
    doctor_slug: string;
    service_id: string;
    start_at_ms: number;
    end_at_ms: number;
    confirm_by_ms: number;
    patient_name: string;
    whatsapp: string;
    notes: string | null;
    durationMinutes?: number;
    service?: { id: string; name: string } | null;
};

type StatusResponse = { ok: true; booking: BookingStatus } | { ok: false; error: string };

function isOkResponse(value: unknown): value is { ok: true } {
    return !!value && typeof value === "object" && (value as { ok?: unknown }).ok === true;
}

function unitLabelFromSlug(slug: string | null | undefined): string | null {
    if (!slug) return null;
    if (slug === "barrashoppingsul") return "BarraShoppingSul";
    if (slug === "novo-hamburgo" || slug === "novohamburgo") return "Novo Hamburgo";
    return null;
}

function normalizeSlug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findUnit(slug: string | null | undefined) {
    if (!slug) return null;
    return (
        units.find((u) => u.slug === slug) ??
        units.find((u) => normalizeSlug(u.slug) === normalizeSlug(slug)) ??
        null
    );
}

function avatarUrl(handle: string, name: string) {
    const h = encodeURIComponent(handle);
    const n = encodeURIComponent(name);
    return `/api/instagram-avatar?handle=${h}&name=${n}`;
}

function initialsFromName(name: string) {
    const letters = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
    return letters || "EF";
}

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function formatLocalDateKey(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDatePtBr(dateKey: string): string {
    const [y, m, d] = dateKey.split("-").map((x) => Number(x));
    if (!y || !m || !d) return dateKey;
    return `${pad2(d)}/${pad2(m)}/${y}`;
}

function parseLocalDateKey(dateKey: string): Date | null {
    const [y, m, d] = dateKey.split("-").map((x) => Number(x));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function weekdayPtBrShort(dateKey: string): string {
    const dt = parseLocalDateKey(dateKey);
    if (!dt) return "";
    return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][dt.getDay()] ?? "";
}

function formatTimeFromMs(ms: number): string {
    const dt = new Date(ms);
    return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}

function formatDeadline(ms: number): string {
    const dt = new Date(ms);
    return `${formatTimeFromMs(ms)} (${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)})`;
}

function formatBrPhone(input: string): string {
    const digits = (input ?? "").replace(/\D/g, "");
    const d = digits.slice(0, 11);
    if (d.length <= 2) return d ? `(${d}` : "";
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatCpf(input: string): string {
    const digits = (input ?? "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function ScrollPicker(props: { ariaLabel: string; children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const update = () => {
        const el = ref.current;
        if (!el) return;
        const left = el.scrollLeft;
        const maxLeft = el.scrollWidth - el.clientWidth;
        setCanLeft(left > 1);
        setCanRight(left < maxLeft - 1);
    };

    useEffect(() => {
        update();
        const onResize = () => update();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.currentTarget.scrollLeft += event.deltaY;
        event.preventDefault();
    };

    const scrollByDir = (dir: -1 | 1) => {
        const el = ref.current;
        if (!el) return;
        const delta = Math.max(220, Math.floor(el.clientWidth * 0.8));
        el.scrollBy({ left: dir * delta, behavior: "smooth" });
    };

    return (
        <div className={`bookingFlow__picker ${props.className ?? ""}`.trim()}>
            <button
                type="button"
                className="bookingFlow__scrollArrow bookingFlow__scrollArrow--left"
                onClick={() => scrollByDir(-1)}
                disabled={!canLeft}
                aria-label="Rolagem para a esquerda"
            >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <button
                type="button"
                className="bookingFlow__scrollArrow bookingFlow__scrollArrow--right"
                onClick={() => scrollByDir(1)}
                disabled={!canRight}
                aria-label="Rolagem para a direita"
            >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div
                ref={ref}
                className="bookingFlow__scrollWindow"
                onWheel={handleWheel}
                onScroll={update}
                role="group"
                aria-label={props.ariaLabel}
            >
                {props.children}
            </div>
        </div>
    );
}

export default function BookingFlow() {
    const currentUnit = useCurrentUnit();
    const searchParams = useSearchParams();
    const turnstileSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();

    const [step, setStep] = useState<"pick" | "details" | "submitted">("pick");

    const [members, setMembers] = useState<TeamMember[] | null>(null);
    const [doctor, setDoctor] = useState<{ slug: string; name: string; handle: string | null } | null>(null);
    const [service, setService] = useState<Service | null>(null);

    const [includeAvaliacao, setIncludeAvaliacao] = useState(true);
    const [includeProcedimento, setIncludeProcedimento] = useState(false);
    const [includeRevisao, setIncludeRevisao] = useState(false);

    const [dateKey, setDateKey] = useState<string | null>(null);
    const [timeKey, setTimeKey] = useState<string | null>(null);
    const [dateTouched, setDateTouched] = useState(false);

    const [slots, setSlots] = useState<SlotsPayload | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    const [patientName, setPatientName] = useState("");
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [cpf, setCpf] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");

    const [detailsStartedAtMs, setDetailsStartedAtMs] = useState<number | null>(null);
    const [honeypot, setHoneypot] = useState("");
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [turnstileHadError, setTurnstileHadError] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [submitted, setSubmitted] = useState<{ id: string; status: string; confirmByMs: number; notifications?: { email: NotificationResult; whatsapp: NotificationResult } } | null>(null);
    const [status, setStatus] = useState<BookingStatus | null>(null);

    const allowedUnitSlugs = useMemo(() => new Set(["barrashoppingsul", "novo-hamburgo"]), []);

    // Allow deep-linking to a unit via `?unit=` by syncing it into storage (and therefore header selection).
    useEffect(() => {
        const fromQuery = (searchParams?.get("unit") ?? "").trim();
        if (!fromQuery) return;
        const resolved = findUnit(fromQuery);
        if (resolved?.slug && allowedUnitSlugs.has(resolved.slug)) setStoredUnitSlug(resolved.slug);
    }, [allowedUnitSlugs, searchParams]);

    const unitSlug = useMemo(() => {
        const slug = currentUnit?.slug ?? null;
        if (!slug) return null;
        return allowedUnitSlugs.has(slug) ? slug : null;
    }, [allowedUnitSlugs, currentUnit?.slug]);

    const durationMinutes = useMemo(() => {
        return (includeAvaliacao ? 30 : 0) + (includeProcedimento ? 30 : 0) + (includeRevisao ? 15 : 0);
    }, [includeAvaliacao, includeProcedimento, includeRevisao]);

    const lastUnitSlugRef = useRef<string | null>(null);
    const appliedDoctorQueryRef = useRef<string | null>(null);
    useEffect(() => {
        const prev = lastUnitSlugRef.current;
        if (prev === unitSlug) return;
        lastUnitSlugRef.current = unitSlug;
        appliedDoctorQueryRef.current = null;

        if (unitSlug) {
            setDoctor({ slug: "any", name: "Todos", handle: null });
        } else {
            setDoctor(null);
        }
        setService(null);
        setIncludeAvaliacao(true);
        setIncludeProcedimento(false);
        setIncludeRevisao(false);
        setDateKey(null);
        setDateTouched(false);
        setTimeKey(null);
        setStep("pick");
        setDetailsStartedAtMs(null);
        setHoneypot("");
        setTurnstileToken(null);
        setTurnstileHadError(false);
        setSlots(null);
        setSlotsError(null);
        setPatientName("");
        setEmail("");
        setWhatsapp("");
        setCpf("");
        setAddress("");
        setNotes("");
    }, [unitSlug]);

    // Load doctors (injectors) from Google Sheet.
    const [membersError, setMembersError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const res = await fetch("/api/equipe", { cache: "no-store" });
                const json = (await res.json().catch(() => null)) as
                    | { ok?: boolean; members?: TeamMember[]; error?: { code?: string; status?: number } }
                    | null;
                if (cancelled) return;
                setMembers(Array.isArray(json?.members) ? json!.members! : []);
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

    const unit = useMemo(() => findUnit(unitSlug), [unitSlug]);
    const unitLabel = useMemo(() => unitLabelFromSlug(unitSlug), [unitSlug]);
    const doctorsForUnit = useMemo(() => {
        if (!members) return null;
        if (!unitLabel) return [];

        return members
            .filter((m) => m.units.map((u) => u.toLowerCase()).includes(unitLabel.toLowerCase()))
            .map((m) => ({
                name: m.name,
                slug: doctorSlugFromTeamMember(m),
                handle: m.instagramHandle,
                nickname: m.nickname,
                instagramUrl: m.instagramUrl,
            }));
    }, [members, unitLabel]);

    const doctorQuery = useMemo(() => normalizeDoctorSlug(searchParams?.get("doctor") ?? ""), [searchParams]);

    useEffect(() => {
        if (!unitSlug || !doctorsForUnit || doctorsForUnit.length === 0) return;
        if (!doctorQuery || doctorQuery === "any") return;
        if (appliedDoctorQueryRef.current === doctorQuery) return;

        const match = doctorsForUnit.find((d) => {
            if (normalizeDoctorSlug(d.slug) === doctorQuery) return true;
            if (normalizeDoctorSlug(d.handle ?? "") === doctorQuery) return true;
            return normalizeDoctorSlug(d.name) === doctorQuery;
        });

        if (!match) return;
        setDoctor({ slug: match.slug, name: match.name, handle: match.handle });
        appliedDoctorQueryRef.current = doctorQuery;
    }, [doctorQuery, doctorsForUnit, unitSlug]);

    const upcomingDays = useMemo(() => {
        const out: string[] = [];
        const base = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            out.push(formatLocalDateKey(d));
        }
        return out;
    }, []);

    useEffect(() => {
        async function loadSlots() {
            setSlots(null);
            setSlotsError(null);

            if (!unitSlug || !dateKey || durationMinutes <= 0) return;

            setSlotsLoading(true);
            try {
                const url = new URL("/api/booking/slots", window.location.origin);
                url.searchParams.set("unit", unitSlug);
                url.searchParams.set("doctor", doctor?.slug ?? "any");
                url.searchParams.set("service", service?.id ?? "any");
                url.searchParams.set("durationMinutes", String(durationMinutes));
                url.searchParams.set("date", dateKey);

                const res = await fetch(url.toString(), { cache: "no-store" });
                const json = (await res.json().catch(() => null)) as SlotsPayload | { ok: false; error: string } | null;

                if (!res.ok || !json || !isOkResponse(json)) {
                    const err = (json && !isOkResponse(json) && "error" in json && typeof json.error === "string" && json.error) || "Não foi possível carregar horários.";
                    if (err === "doctors_unavailable") {
                        setSlotsError("Equipe indisponível no momento. Tente novamente mais tarde.");
                    } else {
                        setSlotsError(err);
                    }
                    return;
                }

                setSlots(json as SlotsPayload);
            } catch {
                setSlotsError("Falha de rede ao carregar horários.");
            } finally {
                setSlotsLoading(false);
            }
        }

        loadSlots();
    }, [unitSlug, doctor?.slug, service?.id, durationMinutes, dateKey]);

    async function submit() {
        setSubmitError(null);

        if (!unitSlug) {
            setSubmitError("Selecione a unidade no topo para agendar.");
            return;
        }
        if (!doctor || !service || !dateKey || !timeKey) {
            setSubmitError("Selecione profissional, procedimento, data e horário.");
            return;
        }
        if (durationMinutes <= 0) {
            setSubmitError("Selecione ao menos um tipo de atendimento (tempo).");
            return;
        }
        if (!patientName.trim()) {
            setSubmitError("Informe seu nome.");
            return;
        }
        if (!emailValue || !emailSeemsValid) {
            setSubmitError("Informe um e-mail válido.");
            return;
        }
        if (!whatsapp.trim()) {
            setSubmitError("Informe seu WhatsApp.");
            return;
        }
        if (!cpfDigits || !cpfSeemsValid) {
            setSubmitError("Informe um CPF válido.");
            return;
        }
        if (!address.trim()) {
            setSubmitError("Informe seu endereço completo.");
            return;
        }
        if (turnstileSiteKey && !turnstileToken) {
            setSubmitError("Confirme que você não é um robô.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/booking/request", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    unitSlug,
                    doctorSlug: doctor.slug,
                    doctorName: doctor.name,
                    serviceId: service.id,
                    durationMinutes,
                    includes: {
                        avaliacao: includeAvaliacao,
                        procedimento: includeProcedimento,
                        revisao: includeRevisao,
                    },
                    date: dateKey,
                    time: timeKey,
                    patientName,
                    email: emailValue,
                    whatsapp,
                    cpf: cpfDigits,
                    address: address.trim(),
                    notes,
                    hp: honeypot,
                    formStartedAtMs: detailsStartedAtMs,
                    turnstileToken,
                }),
            });

            const json = (await res.json().catch(() => null)) as RequestResponse | null;

            if (!json || json.ok !== true) {
                const err = (json && "error" in json && json.error) || "Não foi possível enviar seu pedido.";
                if (err === "slot_in_review") {
                    setSubmitError("Esse horário acabou de entrar em análise. Escolha outro horário.");
                    return;
                }
                if (err === "no_availability") {
                    setSubmitError("Esse horário não está mais disponível. Escolha outro horário.");
                    return;
                }
                if (err === "no_doctors_for_unit") {
                    setSubmitError("Não foi possível selecionar um profissional para esta unidade. Tente escolher um profissional específico.");
                    return;
                }
                if (err === "doctors_unavailable") {
                    setSubmitError("Equipe indisponível no momento. Tente novamente mais tarde.");
                    return;
                }
                if (err === "rate_limited") {
                    setSubmitError("Muitas tentativas em sequência. Aguarde alguns segundos e tente novamente.");
                    return;
                }
                if (err === "too_fast") {
                    setSubmitError("Muito rápido. Aguarde um instante e tente novamente.");
                    return;
                }
                if (err === "spam_detected") {
                    setSubmitError("Não foi possível enviar. Recarregue a página e tente novamente.");
                    return;
                }
                if (err === "invalid_email") {
                    setSubmitError("Informe um e-mail válido.");
                    return;
                }
                if (err === "invalid_cpf") {
                    setSubmitError("Informe um CPF válido.");
                    return;
                }
                if (err === "missing_address") {
                    setSubmitError("Informe seu endereço completo.");
                    return;
                }
                if (err === "turnstile_failed") {
                    setSubmitError("Falha na verificação anti-robô. Recarregue a página e tente novamente.");
                    return;
                }
                setSubmitError("Não foi possível enviar seu pedido. Tente novamente.");
                return;
            }

            setSubmitted({ id: json.id, status: json.status, confirmByMs: json.confirmByMs, notifications: json.notifications });
            setStep("submitted");
        } catch {
            setSubmitError("Falha de rede ao enviar.");
        } finally {
            setSubmitting(false);
        }
    }

    // Poll status after submit
    useEffect(() => {
        if (!submitted) return;
        const bookingId = submitted.id;
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        async function tick() {
            try {
                const res = await fetch(`/api/booking/status?id=${encodeURIComponent(bookingId)}`, { cache: "no-store" });
                const json = (await res.json().catch(() => null)) as StatusResponse | null;
                if (cancelled) return;
                if (res.ok && json && isOkResponse(json)) {
                    setStatus((json as { ok: true; booking: BookingStatus }).booking);
                }
            } catch {
                // ignore
            } finally {
                if (!cancelled) timer = setTimeout(tick, 25_000);
            }
        }

        tick();
        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [submitted]);

    const canPickProcedure = !!unitSlug;
    const canPickServices = canPickProcedure && !!service;
    const canPick = !!unitSlug && durationMinutes > 0; // date+time

    // Auto-select today's date once the required selections are ready.
    useEffect(() => {
        if (!canPick) return;
        if (dateKey) return;
        if (dateTouched) return;
        if (!upcomingDays.length) return;
        setDateKey(upcomingDays[0] ?? null);
    }, [canPick, dateKey, dateTouched, upcomingDays]);

    const selectedSlot = useMemo(() => {
        if (!slots?.slots || !timeKey) return null;
        return slots.slots.find((s) => s.time === timeKey) ?? null;
    }, [slots?.slots, timeKey]);

    const showSensitiveHint = true;
    const emailValue = email.trim().toLowerCase();
    const emailSeemsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    const whatsappDigits = whatsapp.replace(/\D/g, "");
    const whatsappSeemsValid = whatsappDigits.length >= 10;
    const cpfDigits = cpf.replace(/\D/g, "");
    const cpfSeemsValid = cpfDigits.length === 11;
    const addressSeemsValid = address.trim().length >= 6;
    const turnstileRequired = !!turnstileSiteKey;
    const canSubmit =
        !!selectedSlot &&
        !!patientName.trim() &&
        emailSeemsValid &&
        whatsappSeemsValid &&
        cpfSeemsValid &&
        addressSeemsValid &&
        (!turnstileRequired || !!turnstileToken);

    const showDetailsModal = step === "details" && !!unitSlug && !!doctor && !!service && !!dateKey && !!timeKey;

    useEffect(() => {
        if (!showDetailsModal) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [showDetailsModal]);

    useEffect(() => {
        if (!showDetailsModal) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setStep("pick");
                setSubmitError(null);
                setTurnstileToken(null);
                setTurnstileHadError(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showDetailsModal]);

    function selectDoctor(nextDoctor: { slug: string; name: string; handle: string | null }) {
        if (doctor?.slug === nextDoctor.slug) return;
        setDoctor(nextDoctor);
        setDateKey(null);
        setDateTouched(false);
        setTimeKey(null);
        setStep("pick");
    }

    return (
        <div className="bookingFlow">
            {step !== "submitted" ? (
                <div className="bookingFlow__grid">
                    {!unitSlug ? (
                        <div className="card bookingFlow__cardEntryUnit" style={{ padding: 16 }}>
                            <div className="bookingFlow__entryEyebrow">Entrada 01</div>
                            <div className="bookingFlow__entryTitle">Escolha a unidade</div>
                            <div className="bookingFlow__cardSub">A unidade libera a equipe, o procedimento e os horários reais.</div>
                            <div className="bookingFlow__embeddedUnitChooser">
                                <UnitChooser />
                            </div>
                        </div>
                    ) : null}

                    <div
                        className={`card bookingFlow__cardDoctor ${unitSlug ? "bookingFlow__cardDoctor--full" : "bookingFlow__cardDoctor--withUnit"}`.trim()}
                        style={{ padding: 16 }}
                    >
                        <div className="bookingFlow__entryEyebrow">Entrada 02</div>
                        <div className="bookingFlow__entryTitle">Escolha o doutor</div>
                        {unit ? (
                            <div className="small bookingFlow__unitStatus">
                                Unidade selecionada: <span className="bookingFlow__unitName">{unit.name}</span>
                            </div>
                        ) : null}
                        <div className="bookingFlow__cardSub">Passe o mouse sobre a badge para ver os dados do doutor e clique para selecionar.</div>
                        <div style={{ marginTop: 10 }}>
                            {!unitLabel ? (
                                <div className="small bookingFlow__unitStatus bookingFlow__unitStatus--error" role="status">
                                    Selecione a unidade para liberar os doutores.
                                </div>
                            ) : doctorsForUnit === null ? (
                                <div className="small">Carregando equipe…</div>
                            ) : doctorsForUnit.length === 0 ? (
                                <div className="small">
                                    {membersError ? "Equipe indisponível no momento. Tente novamente mais tarde." : "Nenhum doutor encontrado para esta unidade."}
                                </div>
                            ) : (
                                <div className="bookingFlow__doctorBadgeGrid" role="list" aria-label="Lista de profissionais">
                                    {doctorsForUnit.map((d) => {
                                        const active = doctor?.slug === d.slug;
                                        const instagramHref = d.instagramUrl ?? (d.handle ? `https://instagram.com/${d.handle.replace(/^@/, "")}` : null);
                                        return (
                                            <div key={d.slug} className="bookingFlow__doctorBadgeWrap" data-active={active ? "true" : "false"} role="listitem">
                                                <button
                                                    type="button"
                                                    className="bookingFlow__doctorBadge"
                                                    data-active={active ? "true" : "false"}
                                                    onClick={() => selectDoctor({ slug: d.slug, name: d.name, handle: d.handle })}
                                                    aria-label={`Selecionar ${d.name}`}
                                                >
                                                    <span className="bookingFlow__doctorBadgeAvatar">
                                                        {d.handle ? (
                                                            <Image
                                                                src={avatarUrl(d.handle, d.nickname ?? d.name)}
                                                                alt={d.nickname ?? d.name}
                                                                fill
                                                                sizes="76px"
                                                                style={{ objectFit: "cover" }}
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <span className="bookingFlow__doctorBadgeFallback">{initialsFromName(d.nickname ?? d.name)}</span>
                                                        )}
                                                    </span>
                                                </button>
                                                <div className="bookingFlow__doctorTooltip" role="tooltip">
                                                    <div className="bookingFlow__doctorTooltipName">{d.name}</div>
                                                    <div className="bookingFlow__doctorTooltipSub">{d.nickname || unitLabel}</div>
                                                    {instagramHref ? (
                                                        <a
                                                            className="bookingFlow__doctorTooltipLink"
                                                            href={instagramHref}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            Instagram
                                                        </a>
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="bookingFlow__doctorBadgeWrap" data-active={doctor?.slug === "any" ? "true" : "false"} role="listitem">
                                        <button
                                            type="button"
                                            className="bookingFlow__doctorBadge bookingFlow__doctorBadge--all"
                                            data-active={doctor?.slug === "any" ? "true" : "false"}
                                            onClick={() => selectDoctor({ slug: "any", name: "Todos", handle: null })}
                                            aria-label="Selecionar todos os doutores"
                                        >
                                            <span className="bookingFlow__doctorBadgeAvatar bookingFlow__doctorBadgeAvatar--all">
                                                <span className="bookingFlow__doctorBadgeFallback bookingFlow__doctorBadgeFallback--all">Todos</span>
                                            </span>
                                        </button>
                                        <div className="bookingFlow__doctorTooltip" role="tooltip">
                                            <div className="bookingFlow__doctorTooltipName">Todos</div>
                                            <div className="bookingFlow__doctorTooltipSub">Mostra a agenda mais ampla da unidade.</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`card bookingFlow__cardProcedure ${canPickProcedure ? "" : "bookingFlow__card--locked"}`.trim()} style={{ padding: 16 }}>
                        <div style={{ fontWeight: 900 }}>2) Procedimento</div>
                        <div className="bookingFlow__cardSub">Selecione o procedimento (ou peça orientação).</div>
                        {!canPickProcedure ? (
                            <div className="bookingFlow__lockOverlay" aria-hidden="true">
                                <div className="bookingFlow__lockText">Selecione a unidade no topo para continuar.</div>
                            </div>
                        ) : null}
                        <ScrollPicker ariaLabel="Lista de procedimentos">
                            {services.map((s) => {
                                const active = service?.id === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        disabled={!canPickProcedure}
                                        className={`bookingFlow__procedureCard ${active ? "bookingFlow__procedureCard--active" : ""}`.trim()}
                                        onClick={() => {
                                            if (active) {
                                                setService(null);
                                            } else {
                                                setService(s);
                                            }
                                            setDateKey(null);
                                            setDateTouched(false);
                                            setTimeKey(null);
                                            setStep("pick");
                                        }}
                                        style={{
                                            textAlign: "left",
                                            width: 240,
                                            minWidth: 240,
                                            flex: "0 0 auto",
                                            scrollSnapAlign: "start",
                                        }}
                                    >
                                        {s.highlightImage ? (
                                            <Image
                                                src={s.highlightImage}
                                                alt={s.name}
                                                fill
                                                sizes="240px"
                                                style={{ objectFit: "cover" }}
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="bookingFlow__procedureMediaFallback" aria-hidden="true">
                                                EF
                                            </div>
                                        )}
                                        <div className="bookingFlow__procedureOverlay">
                                            <div className="bookingFlow__procedureTitle">{s.name}</div>
                                            {s.subtitle ? <div className="bookingFlow__procedureSub">{s.subtitle}</div> : null}
                                        </div>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                disabled={!canPickProcedure}
                                className={`bookingFlow__procedureCard ${service?.id === "any" ? "bookingFlow__procedureCard--active" : ""}`.trim()}
                                onClick={() => {
                                    const active = service?.id === "any";
                                    if (active) {
                                        setService(null);
                                    } else {
                                        setService({ id: "any", name: "Quero orientação", subtitle: "Ainda não sei qual procedimento" });
                                    }
                                    setDateKey(null);
                                    setDateTouched(false);
                                    setTimeKey(null);
                                    setStep("pick");
                                }}
                                style={{ textAlign: "left", width: 240, minWidth: 240, flex: "0 0 auto", scrollSnapAlign: "start" }}
                            >
                                <div className="bookingFlow__procedureMediaFallback" aria-hidden="true">
                                    EF
                                </div>
                                <div className="bookingFlow__procedureOverlay">
                                    <div className="bookingFlow__procedureTitle">Quero orientação</div>
                                    <div className="bookingFlow__procedureSub">Ainda não sei qual procedimento</div>
                                </div>
                            </button>
                        </ScrollPicker>
                    </div>

                    <div className={`card bookingFlow__cardServices ${canPickServices ? "" : "bookingFlow__card--locked"}`.trim()} style={{ padding: 16 }}>
                        <div style={{ fontWeight: 900 }}>3) Serviços</div>
                        <div className="bookingFlow__cardSub">Selecione um ou mais serviços para calcular o tempo.</div>
                        {!canPickServices ? (
                            <div className="bookingFlow__lockOverlay" aria-hidden="true">
                                <div className="bookingFlow__lockText">Selecione um procedimento para continuar.</div>
                            </div>
                        ) : null}
                        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                            <div className="small" style={{ color: "var(--muted)" }}>
                                Total: <span style={{ fontWeight: 900 }}>{durationMinutes} min</span>
                            </div>
                            <div style={{ display: "grid", gap: 10 }}>
                                {[
                                    {
                                        key: "avaliacao" as const,
                                        label: "Avaliação",
                                        minutes: 30,
                                        active: includeAvaliacao,
                                        toggle: () => setIncludeAvaliacao((v) => !v),
                                    },
                                    {
                                        key: "procedimento" as const,
                                        label: "Procedimento",
                                        minutes: 30,
                                        active: includeProcedimento,
                                        toggle: () => setIncludeProcedimento((v) => !v),
                                    },
                                    {
                                        key: "revisao" as const,
                                        label: "Revisão",
                                        minutes: 15,
                                        active: includeRevisao,
                                        toggle: () => setIncludeRevisao((v) => !v),
                                    },
                                ].map((opt) => (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        aria-pressed={opt.active}
                                        disabled={!canPickServices}
                                        className="bookingFlow__selectItem bookingFlow__serviceBtn"
                                        data-active={opt.active ? "true" : "false"}
                                        onClick={() => {
                                            opt.toggle();
                                            setDateKey(null);
                                            setDateTouched(false);
                                            setTimeKey(null);
                                            setStep("pick");
                                        }}
                                        style={{
                                            padding: "10px 12px",
                                            fontWeight: 900,
                                            opacity: canPickServices ? 1 : 0.6,
                                            textAlign: "left",
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {durationMinutes <= 0 ? (
                                <div className="small" style={{ color: "#b91c1c", fontWeight: 700 }}>
                                    Selecione ao menos uma opção para calcular o tempo.
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className={`card bookingFlow__cardFull bookingFlow__cardDateTime ${canPick ? "" : "bookingFlow__card--locked"}`.trim()} style={{ padding: 16 }}>
                        <div className="bookingFlow__cardHeader">
                            <div style={{ fontWeight: 900 }}>4) Data e horário</div>
                            <div className="bookingFlow__legend" aria-hidden="true">
                                <div className="bookingFlow__legendItem">
                                    <span className="bookingFlow__legendSwatch bookingFlow__legendSwatch--past" />
                                    Passou
                                </div>
                                <div className="bookingFlow__legendItem">
                                    <span className="bookingFlow__legendSwatch bookingFlow__legendSwatch--occupied" />
                                    Ocupado
                                </div>
                            </div>
                        </div>
                        <div className="bookingFlow__cardSub">
                            {upcomingDays.length ? `${formatDatePtBr(upcomingDays[0])} – ${formatDatePtBr(upcomingDays[upcomingDays.length - 1] ?? upcomingDays[0])}` : null}
                        </div>
                        {!canPick ? (
                            <div className="bookingFlow__lockOverlay" aria-hidden="true">
                                <div className="bookingFlow__lockText">Selecione a unidade no topo para ver horários.</div>
                            </div>
                        ) : null}

                        <div className="bookingFlow__datetimeGrid" style={{ marginTop: 12 }}>
                            <div>
                                <div className="small" style={{ fontWeight: 800, marginBottom: 8 }}>
                                    Datas
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
                                    {upcomingDays.map((d) => {
                                        const active = dateKey === d;
                                        return (
                                            <button
                                                key={d}
                                                type="button"
                                                disabled={!canPick}
                                                className="bookingFlow__selectItem bookingFlow__dateBtn"
                                                data-active={active ? "true" : "false"}
                                                onClick={() => {
                                                    setDateTouched(true);
                                                    if (active) {
                                                        setDateKey(null);
                                                        setTimeKey(null);
                                                        setStep("pick");
                                                        return;
                                                    }

                                                    setDateKey(d);
                                                    setTimeKey(null);
                                                    setStep("pick");
                                                }}
                                                style={{
                                                    opacity: canPick ? 1 : 0.5,
                                                    fontWeight: 900,
                                                    borderRadius: 12,
                                                    padding: "10px 8px",
                                                    textAlign: "center",
                                                    display: "grid",
                                                    gap: 2,
                                                }}
                                            >
                                                <div style={{ fontSize: 11, fontWeight: 800, opacity: active ? 0.9 : 0.75 }}>
                                                    {weekdayPtBrShort(d)}
                                                </div>
                                                <div style={{ fontSize: 14, fontWeight: 950, letterSpacing: "-0.2px" }}>
                                                    {parseLocalDateKey(d)?.getDate()}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {!canPick ? (
                                    <div className="small" style={{ marginTop: 10 }}>
                                        Selecione a unidade no topo para liberar as datas.
                                    </div>
                                ) : null}
                            </div>

                            <div>
                                <div className="small" style={{ fontWeight: 800, marginBottom: 8 }}>
                                    Horários
                                </div>
                                <div style={{ minHeight: 44 }}>
                                    {!dateKey ? (
                                        <div className="small">Escolha uma data para ver horários.</div>
                                    ) : slotsLoading ? (
                                        <div className="small">Carregando horários…</div>
                                    ) : slotsError ? (
                                        <div className="small">{slotsError}</div>
                                    ) : slots ? (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
                                            {slots.slots.map((s) => {
                                                const active = timeKey === s.time;
                                                const isPast = s.reason === "past";
                                                const isAgenda = s.reason === "agenda";
                                                const hasTooltip = isPast || isAgenda;
                                                const tooltip = isPast ? "horário já passou" : isAgenda ? "horário ocupado" : "";
                                                const ariaDisabled = !s.available;
                                                const nativeDisabled = !s.available && !hasTooltip;
                                                const label =
                                                    isPast || isAgenda
                                                        ? ""
                                                        : s.reason === "booked"
                                                            ? "Indisponível"
                                                            : s.reason === "in_review"
                                                                ? "Em análise"
                                                                : "";

                                                return (
                                                    <button
                                                        key={s.time}
                                                        type="button"
                                                        disabled={nativeDisabled}
                                                        aria-disabled={ariaDisabled ? "true" : "false"}
                                                        data-reason={s.reason ?? ""}
                                                        data-locked={hasTooltip ? "true" : "false"}
                                                        data-tooltip={hasTooltip ? tooltip : undefined}
                                                        className="bookingFlow__selectItem bookingFlow__timeBtn"
                                                        data-active={active ? "true" : "false"}
                                                        onClick={() => {
                                                            if (ariaDisabled) return;
                                                            if (active) {
                                                                if (step !== "details") {
                                                                    setStep("details");
                                                                    setDetailsStartedAtMs(Date.now());
                                                                    setTurnstileToken(null);
                                                                    setTurnstileHadError(false);
                                                                    setSubmitError(null);
                                                                    return;
                                                                }
                                                                setTimeKey(null);
                                                                setStep("pick");
                                                                setDetailsStartedAtMs(null);
                                                                setTurnstileToken(null);
                                                                setTurnstileHadError(false);
                                                                setSubmitError(null);
                                                                return;
                                                            }
                                                            setTimeKey(s.time);
                                                            setStep("details");
                                                            setDetailsStartedAtMs(Date.now());
                                                            setTurnstileToken(null);
                                                            setTurnstileHadError(false);
                                                            setSubmitError(null);
                                                        }}
                                                        tabIndex={ariaDisabled ? -1 : 0}
                                                        style={{
                                                            padding: "12px 12px",
                                                            borderRadius: 12,
                                                            fontWeight: 900,
                                                            textAlign: "left",
                                                        }}
                                                    >
                                                        <div>{s.time}</div>
                                                        {label ? <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>{label}</div> : null}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="small">Escolha um procedimento para filtrar horários ou selecione uma data.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="bookingFlow__grid">
                    <div className="card bookingFlow__cardFull" style={{ padding: 18 }}>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>
                            {submitted?.status === "confirmed" ? "Reserva confirmada" : "Pedido enviado"}
                        </div>
                        {submitted ? (
                            <>
                                <div className="small" style={{ marginTop: 8 }}>
                                    Protocolo: <span style={{ fontWeight: 900 }}>{submitted.id}</span>
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    {submitted.status === "confirmed"
                                        ? "Enviamos a confirmação para seu e-mail e WhatsApp."
                                        : `Seu pedido entrou na fila. Prazo: ${formatDeadline(submitted.confirmByMs)}.`}
                                </div>
                                {submitted.notifications && submitted.status === "confirmed" ? (
                                    <div className="small" style={{ marginTop: 6 }}>
                                        E-mail: {submitted.notifications.email.status} · WhatsApp: {submitted.notifications.whatsapp.status}
                                    </div>
                                ) : null}
                            </>
                        ) : null}

                        {status ? (
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                                <div style={{ fontWeight: 900 }}>Status</div>
                                <div style={{ marginTop: 6 }}>
                                    {status.status === "confirmed" ? (
                                        <span style={{ fontWeight: 900, color: "#16a34a" }}>Confirmado</span>
                                    ) : status.status === "declined" ? (
                                        <span style={{ fontWeight: 900, color: "#b91c1c" }}>Não confirmado</span>
                                    ) : status.status === "expired" ? (
                                        <span style={{ fontWeight: 900, color: "#b45309" }}>Expirado</span>
                                    ) : status.status === "needs_approval" ? (
                                        <span style={{ fontWeight: 900, color: "#b45309" }}>Em análise</span>
                                    ) : (
                                        <span style={{ fontWeight: 900 }}>Pendente</span>
                                    )}
                                </div>
                                <div className="small" style={{ marginTop: 6 }}>
                                    Atualiza automaticamente.
                                </div>
                            </div>
                        ) : null}

                        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                                type="button"
                                className="pill"
                                onClick={() => {
                                    // restart
                                    setStep("pick");
                                    setDoctor(null);
                                    setService(null);
                                    setIncludeAvaliacao(true);
                                    setIncludeProcedimento(false);
                                    setIncludeRevisao(false);
                                    setDateKey(null);
                                    setDateTouched(false);
                                    setTimeKey(null);
                                    setPatientName("");
                                    setEmail("");
                                    setWhatsapp("");
                                    setCpf("");
                                    setAddress("");
                                    setNotes("");
                                    setSlots(null);
                                    setSubmitted(null);
                                    setStatus(null);
                                    setSubmitError(null);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                Fazer outro pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && unitSlug && doctor && service && dateKey && timeKey ? (
                <div
                    className="bookingFlow__modalBackdrop"
                    role="dialog"
                    aria-modal="true"
                    onClick={(event) => {
                        if (event.target !== event.currentTarget) return;
                        setStep("pick");
                        setSubmitError(null);
                        setTurnstileToken(null);
                        setTurnstileHadError(false);
                    }}
                >
                    <div className="bookingFlow__modalCard">
                        <div className="bookingFlow__modalHeader">
                            <div>
                                <div style={{ fontWeight: 900 }}>Finalizar agendamento</div>
                                <div className="small" style={{ marginTop: 4 }}>
                                    {service.name} ({durationMinutes} min) · {formatDatePtBr(dateKey)} às {timeKey}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="bookingFlow__modalClose"
                                aria-label="Fechar"
                                onClick={() => {
                                    setStep("pick");
                                    setSubmitError(null);
                                    setTurnstileToken(null);
                                    setTurnstileHadError(false);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="bookingFlow__modalBody">
                            <div
                                aria-hidden="true"
                                style={{
                                    position: "absolute",
                                    left: "-10000px",
                                    top: "auto",
                                    width: 1,
                                    height: 1,
                                    overflow: "hidden",
                                }}
                            >
                                <label>
                                    Empresa
                                    <input
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                        tabIndex={-1}
                                        autoComplete="off"
                                        inputMode="text"
                                    />
                                </label>
                            </div>

                            <div className="bookingFlow__modalHint">
                                Esses dados criam sua conta para futuros agendamentos.
                            </div>

                            <div className="bookingFlow__formGrid">
                                <label className="bookingFlow__field">
                                    <span>Nome</span>
                                    <input
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="Seu nome"
                                        autoComplete="name"
                                        className="bookingFlow__input"
                                    />
                                </label>

                                <label className="bookingFlow__field">
                                    <span>E-mail</span>
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="voce@email.com"
                                        autoComplete="email"
                                        inputMode="email"
                                        className="bookingFlow__input"
                                        aria-invalid={email.length > 0 && !emailSeemsValid}
                                    />
                                </label>
                            </div>
                            {email.length > 0 && !emailSeemsValid ? (
                                <div className="bookingFlow__fieldError">Informe um e-mail válido.</div>
                            ) : null}

                            <div className="bookingFlow__formGrid">
                                <label className="bookingFlow__field">
                                    <span>WhatsApp</span>
                                    <input
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(formatBrPhone(e.target.value))}
                                        placeholder="(DDD) 9xxxx-xxxx"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        aria-invalid={whatsapp.length > 0 && !whatsappSeemsValid}
                                        className="bookingFlow__input"
                                    />
                                </label>

                                <label className="bookingFlow__field">
                                    <span>CPF</span>
                                    <input
                                        value={cpf}
                                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                                        placeholder="000.000.000-00"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        aria-invalid={cpf.length > 0 && !cpfSeemsValid}
                                        className="bookingFlow__input"
                                    />
                                </label>
                            </div>
                            {!whatsappSeemsValid && whatsapp.length > 0 ? (
                                <div className="bookingFlow__fieldError">Informe DDD + número (ex.: (51) 99999-9999).</div>
                            ) : null}
                            {!cpfSeemsValid && cpf.length > 0 ? (
                                <div className="bookingFlow__fieldError">Informe um CPF válido.</div>
                            ) : null}

                            <label className="bookingFlow__field">
                                <span>Endereço completo</span>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Rua, número, bairro, cidade e CEP"
                                    rows={2}
                                    className="bookingFlow__textarea"
                                />
                            </label>
                            {!addressSeemsValid && address.length > 0 ? (
                                <div className="bookingFlow__fieldError">Informe o endereço completo.</div>
                            ) : null}

                            {turnstileRequired ? (
                                <div style={{ display: "grid", gap: 8 }}>
                                    <TurnstileWidget
                                        siteKey={turnstileSiteKey}
                                        onToken={setTurnstileToken}
                                        onError={() => setTurnstileHadError(true)}
                                    />
                                    {!turnstileToken ? (
                                        <div className="small" style={{ color: turnstileHadError ? "#b91c1c" : "var(--muted)" }}>
                                            {turnstileHadError ? "Não foi possível carregar a verificação anti-robô." : "Confirme que você não é um robô para enviar."}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            <label className="bookingFlow__field">
                                <span>Observações (opcional)</span>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={showSensitiveHint ? "Opcional. Evite informações sensíveis; use apenas preferências (ex.: melhor horário)." : "Opcional"}
                                    rows={3}
                                    className="bookingFlow__textarea"
                                />
                            </label>

                            <div className="bookingFlow__modalActions">
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={submitting || !canSubmit}
                                    className="bookingFlow__primaryBtn"
                                >
                                    {submitting ? "Confirmando…" : "Confirmar reserva"}
                                </button>
                                <button
                                    type="button"
                                    className="bookingFlow__ghostBtn"
                                    onClick={() => {
                                        setStep("pick");
                                        setSubmitError(null);
                                        setTurnstileToken(null);
                                        setTurnstileHadError(false);
                                    }}
                                >
                                    Voltar
                                </button>
                            </div>

                            {submitError ? (
                                <div role="status" className="bookingFlow__fieldError">
                                    {submitError}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
