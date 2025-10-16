import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roof Inspection Report Automation",
  description: "Automated insurance claim documentation for roofing companies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
