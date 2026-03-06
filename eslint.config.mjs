import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
    ...coreWebVitals,
    ...nextTypescript,
    {
        rules: {
            // The codebase intentionally hydrates a few client-only states from storage, media queries,
            // and third-party script readiness. Next 16 surfaces these as errors; keep them explicit
            // without blocking the framework migration.
            "react-hooks/set-state-in-effect": "off",
        },
    },
];

export default config;
