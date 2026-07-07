import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="app-main min-h-screen">{children}</main>
    </>
  );
}
