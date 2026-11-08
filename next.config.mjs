/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Strip console.log in production builds; keep error/warn for diagnostics.
    // Dev builds retain all console calls.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  experimental: {
    serverActions: {
      // Media uploads (images/audio) are sent through Server Actions in this app.
      // Default is 1 MB and causes connection resets for larger files.
      bodySizeLimit: "50mb",
      // Production is served behind a reverse proxy that can cause Next.js
      // CSRF origin checks to fail with 403. Whitelist the public host.
      allowedOrigins: ["backoffice.audiotoursnewyork.com"],
    },
  },
};

export default nextConfig;
