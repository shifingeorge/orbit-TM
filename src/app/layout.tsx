import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
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
      <body className="antialiased">
        <Sidebar />
        <main className="ml-[72px] min-h-screen relative">
          {children}
        </main>
      </body>
    </html>
  );
}
