import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { MoodProvider } from "@/components/providers/MoodProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LiveMoodFeedback } from "@/components/ui/LiveMoodFeedback";
import { AdSenseScript } from "@/components/AdSenseScript";
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
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://vibed-to-cracked.com"
  ),
  title: "Vibed to Cracked - Learn Programming at Your Own Pace",
  description:
    "Become a web developer at your own pace with mood-driven content. Choose chill, rush, or grind mode for personalized tutorials, quizzes, and coding challenges.",
  keywords:
    "learn programming, web development, javascript tutorials, coding challenges, mood-driven learning, DSA, OOP, React tutorials",
  openGraph: {
    title: "Vibed to Cracked - Learn Programming at Your Own Pace",
    description:
      "Mood-driven programming learning platform. Tutorials, quizzes, and coding challenges for every skill level.",
    url: "/",
    type: "website",
    siteName: "Vibed to Cracked",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibed to Cracked - Learn Programming at Your Own Pace",
    description:
      "Mood-driven programming learning platform. Tutorials, quizzes, and coding challenges for every skill level.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black min-h-screen`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <MoodProvider>
                <ToastProvider>
                  <AdSenseScript />
                  <Header />
                  <main>{children}</main>
                  <Footer />
                  <LiveMoodFeedback />
                </ToastProvider>
              </MoodProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
