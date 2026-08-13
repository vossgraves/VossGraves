import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voss Graves",
  description: "Free, open-source, ad-free projects and notes from Voss Graves.",
  metadataBase: new URL("https://vossgraves.cyou"),
  openGraph: {
    title: "Voss Graves",
    description: "Noob vibe coder building useful things.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
