import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvikBot Workspace",
  description: "Professional chatbot and PDF search workspace UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
