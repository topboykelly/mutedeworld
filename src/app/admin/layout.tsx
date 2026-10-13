import type { Metadata } from "next";

// Every admin page reads the login cookie, so navigations here wait for the server.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Mutedeworld Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper">{children}</div>;
}
