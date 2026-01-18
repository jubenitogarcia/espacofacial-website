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

    // 404
    {
        const res = await fetchHead("/nao-existe", { redirect: "follow" });
        assert(res.status === 404, `/nao-existe expected 404, got ${res.status}`);
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

    console.log("OK: smoke checks passed");
}

run().catch((err) => {
    console.error("Smoke FAILED:", err?.message ?? err);
    process.exit(1);
});
