import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function TwitterImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0f0f10",
                    color: "white",
                    fontFamily:
                        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 60, fontWeight: 900 }}>Espaço Facial</div>
                    <div style={{ marginTop: 14, fontSize: 24, opacity: 0.85 }}>Agende pela sua unidade</div>
                </div>
            </div>
        ),
        size
    );
}
