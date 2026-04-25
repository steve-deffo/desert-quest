import type { Metadata } from "next";
import { Reem_Kufi, Nunito, Amiri } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const reemKufi = Reem_Kufi({
  variable: "--font-reem-kufi",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Desert Quest — La Caravane des Nombres",
  description:
    "A bilingual gamified math adventure across the UAE desert. Grades 4 & 8.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" data-theme="day" className="h-full antialiased">
      <body
        className={`${reemKufi.variable} ${nunito.variable} ${amiri.variable} min-h-full font-[family-name:var(--font-nunito)]`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
