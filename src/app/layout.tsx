import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from "@/components/pwa/sw-registrar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueNorthPoints.ca — Maximize Your Canadian Rewards",
  description:
    "AI-powered credit card rewards optimizer for Canadians. Track your points, get smart recommendations, and never leave rewards on the table.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TrueNorthPoints",
  },
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/icons/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkKey && !clerkKey.includes("REPLACE_ME");

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );

  if (isClerkConfigured) {
    const { ClerkProvider } = await import("@clerk/nextjs");
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
