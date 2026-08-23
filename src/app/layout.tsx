import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brounic Dashboard",
  description: "Project management dashboard for Brounic Fire Fighting Company",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
