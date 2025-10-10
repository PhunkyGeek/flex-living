import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Flex Living Reviews',
  description: 'Manager dashboard for Flex Living guest reviews',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="bg-[#284E4C] shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <img src="/assets/flexliving.png" alt="Flex Living" className="h-8 w-auto" />
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-white hover:underline">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>
                <span>Dashboard</span>
              </Link>
              <Link href="/share" className="flex items-center gap-2 text-sm font-medium text-white hover:underline">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Public Reviews</span>
              </Link>
              <Link href="/docs" className="flex items-center gap-2 text-sm font-medium text-white hover:underline">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 0 1-2 2H7l-4-4V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Docs</span>
              </Link>
              <Link href="/api/reviews/hostaway" className="flex items-center gap-2 text-sm font-medium text-white hover:underline">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>API</span>
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Flex Living
        </footer>
      </body>
    </html>
  );
}