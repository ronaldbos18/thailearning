import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thai Alphabet Learning",
  description: "Personal Thai consonant and vowel visual recognition practice."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
