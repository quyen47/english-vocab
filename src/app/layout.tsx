import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Vocab – Learn by Roots",
  description: "Study English vocabulary through roots, prefixes, and suffixes with AI-powered generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
