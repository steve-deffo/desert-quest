import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import BadgeUnlockModal from "@/components/BadgeUnlockModal";

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
      <body className="min-h-full font-[family-name:var(--font-nunito)]">
        <ClientLayout>{children}</ClientLayout>
        <BadgeUnlockModal />
      </body>
    </html>
  );
}
