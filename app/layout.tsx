import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "KYC — In All Media",
  description: "Know Your Client onboarding tool for In All Media",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-semibold text-lg">
                KYC <span className="text-muted-foreground font-normal">· In All Media</span>
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link href="/" className="hover:underline">
                  Dashboard
                </Link>
                <Link href="/prospects" className="hover:underline">
                  Prospects
                </Link>
                <Link href="/prospects/new" className="hover:underline">
                  + New
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
            {children}
          </main>
          <footer className="border-t bg-white">
            <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-muted-foreground">
              KYC tool · single-user MVP · powered by Claude
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
