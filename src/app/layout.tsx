import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit System",
  description: "Sensory operational dashboard — a living, breathing ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
