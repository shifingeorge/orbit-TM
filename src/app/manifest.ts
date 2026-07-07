import type { MetadataRoute } from "next";

// Next.js 16 metadata route: app/manifest.ts returning a MetadataRoute.Manifest
// object. Served at /manifest.webmanifest and linked automatically in <head>.
// Installable PWA only (no service worker / offline).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orbit",
    short_name: "Orbit",
    description: "Minimal team task manager",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
