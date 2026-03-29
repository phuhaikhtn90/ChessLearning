import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ChessLearning – Học Khai Cuộc",
  description: "Luyện tập khai cuộc cờ vua thông minh với spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        {/* Navigation */}
        <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
              ♟ ChessLearning
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link
                href="/practice"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Luyện tập
              </Link>
              <Link
                href="/progress"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tiến độ
              </Link>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
