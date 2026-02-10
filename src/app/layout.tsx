import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockTrack | Kiosk Inventory Management",
  description: "Secure, intuitive inventory tracking for Android kiosks.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StockTrack",
  }
};

import { InventoryProvider } from "@/lib/inventory-context";
import { UserProvider } from "@/lib/user-context";
import { SettingsProvider } from "@/lib/settings-context";
import { PageWrapper } from "@/components/page-wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground min-h-screen overflow-hidden selection:bg-primary/30`}
      >
        <UserProvider>
          <SettingsProvider>
            <InventoryProvider>
              <PageWrapper>{children}</PageWrapper>
            </InventoryProvider>
          </SettingsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
