import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: 64,
                    background: "linear-gradient(135deg, #111 0%, #2a2a2a 55%, #111 100%)",
                    color: "white",
                    fontFamily:
                        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
                }}
            >
                <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>Espaço Facial</div>
                <div style={{ marginTop: 18, fontSize: 26, opacity: 0.9 }}>
                    Harmonização facial e corporal
                </div>
                <div style={{ marginTop: 28, fontSize: 18, opacity: 0.75 }}>espacofacial.com</div>
            </div>
        ),
        size
    );
}
