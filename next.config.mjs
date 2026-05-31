/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // SAMEORIGIN (not DENY) because we embed Planway iframes on the same origin
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Hero videos rarely change — cache aggressively so repeat visits
        // play from cache instead of re-downloading the file.
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // Slug renamed: "permanent hårfjerning" → "laser hårfjerning".
        // Preserve existing links / search rankings with a permanent 301.
        source: "/behandlinger/permanent-haarfjerning",
        destination: "/behandlinger/laser-haarfjerning",
        permanent: true,
      },
      {
        // BB Glow is no longer a standalone treatment — it's presented as part
        // of Ansigtsbehandling. Redirect the old page to preserve links/SEO.
        source: "/behandlinger/bb-glow",
        destination: "/behandlinger/ansigtsbehandling",
        permanent: true,
      },
    ];
  },
  images: {
    // Explicitly allow AVIF — our local assets are in this format
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
