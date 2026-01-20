const baseUrl = (process.env.SMOKE_BASE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

async function fetchHead(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
        method: "HEAD",
        redirect: options.redirect ?? "manual",
    });
    return res;
}

async function fetchText(path) {
    const res = await fetch(`${baseUrl}${path}`, { redirect: "follow" });
    const text = await res.text();
    return { res, text };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function run() {
    console.log(`Smoke base URL: ${baseUrl}`);

    // Core pages
    for (const path of ["/", "/unidades", "/doutores", "/sobre", "/termos"]) {
        const res = await fetchHead(path, { redirect: "follow" });
        assert(res.status === 200, `${path} expected 200, got ${res.status}`);
    }

    // 404 (some edge adapters return 200 for the not-found document; verify via body markers)
    {
        const { res, text } = await fetchText("/nao-existe");
        assert([200, 404].includes(res.status), `/nao-existe expected 200 or 404, got ${res.status}`);
        assert(/Página não encontrada|404|Not Found/i.test(text), `/nao-existe should render a not-found page`);
    }

    // Robots
    {
        const { res, text } = await fetchText("/robots.txt");
        assert(res.status === 200, `/robots.txt expected 200, got ${res.status}`);
        assert(/Sitemap:/i.test(text), `/robots.txt should include Sitemap:`);
    }

    // Sitemap
    {
        const { res, text } = await fetchText("/sitemap.xml");
        assert(res.status === 200, `/sitemap.xml expected 200, got ${res.status}`);
        assert(/<urlset/.test(text), `/sitemap.xml should contain <urlset`);
    }

    // Redirect endpoints (must be redirects)
    for (const path of [
        "/barrashoppingsul/faleconosco",
        "/novohamburgo/faleconosco",
        "/barrashoppingsul/faleconsco",
        "/novohamburgo/faleconsco",
    ]) {
        const res = await fetchHead(path, { redirect: "manual" });
        assert([301, 302, 307, 308].includes(res.status), `${path} expected redirect, got ${res.status}`);
        const loc = res.headers.get("location");
        assert(loc && /^https:\/\//.test(loc), `${path} expected https Location, got ${loc}`);
    }

    // Header markers (ensure we're not serving an older deployment)
    {
        const { res, text } = await fetchText("/");
        assert(res.status === 200, `/ expected 200, got ${res.status}`);
        assert(text.includes('href="/#sobre-nos"'), `Home HTML should include header link to /#sobre-nos`);
        assert(text.includes('aria-label="Instagram"'), `Home HTML should include Instagram button (aria-label)`);
    }

    console.log("OK: smoke checks passed");
}

run().catch((err) => {
    console.error("Smoke FAILED:", err?.message ?? err);
    process.exit(1);
});
