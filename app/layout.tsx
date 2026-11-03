import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JCA Mock Exam",
  description: "Multi-user JCA mock exam platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
