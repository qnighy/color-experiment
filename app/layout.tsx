import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Color Experiment",
  description: "Color space visualization with SVG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
