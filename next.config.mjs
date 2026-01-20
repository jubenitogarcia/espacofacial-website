/** @type {import('next').NextConfig} */
const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA || "";
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || "";

const nextConfig = {
  poweredByHeader: false,
  images: {
    // We'll serve images from /public for now.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unavatar.io",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Helps validate which deployment is currently served (useful when debugging caching / stale deploys).
          { key: "X-App-Build", value: buildSha || "unknown" },
          { key: "X-App-Build-Time", value: buildTime || "" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
