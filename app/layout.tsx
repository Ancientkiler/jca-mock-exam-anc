import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JCA Mock Exam",
  description:
    "A private mock exam desk for the Supreme Court of India Junior Court Assistant examination.",
  applicationName: "JCA Mock Exam",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f5ef",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
