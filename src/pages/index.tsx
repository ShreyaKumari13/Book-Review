import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<{
    success?: boolean;
    message?: string;
    timestamp?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      setDbStatus({
        success: false,
        message: 'Error testing connection',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    router.push({
      pathname: '/search',
      query: { q: searchQuery }
    });
  };

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Book Review App"
              width={120}
              height={30}
              priority
            />
          </Link>

          <form onSubmit={handleSearchSubmit} className="flex-grow max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books by title or author..."
                className="w-full p-2 pl-10 border rounded-full"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <nav className="hidden md:flex space-x-4">
            <Link href="/api-test-full" className="text-blue-600 hover:underline">
              API Test
            </Link>
            <Link href="/search" className="text-blue-600 hover:underline">
              Advanced Search
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to Book Review</h1>
          <p className="text-lg mb-6">Discover, search, and review your favorite books</p>

          <form onSubmit={handleSearchSubmit} className="max-w-lg">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or author..."
                className="flex-grow p-3 rounded-l-lg text-gray-800"
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-r-lg"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Test Database Connection</h2>
            <button
              onClick={testDatabaseConnection}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>

            {dbStatus && (
              <div className={`mt-4 p-4 rounded-md ${dbStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <h3 className="font-bold">{dbStatus.success ? 'Connection Successful!' : 'Connection Failed'}</h3>
                <p>{dbStatus.message}</p>
                {dbStatus.timestamp && <p>Server time: {dbStatus.timestamp}</p>}
                {dbStatus.error && <p className="text-red-600">Error: {dbStatus.error}</p>}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/api-test-full" className="text-blue-600 hover:underline flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  API Test Page
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-blue-600 hover:underline flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Advanced Search
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto py-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">© 2023 Book Review App</p>
          <div className="flex gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/search" className="text-gray-600 hover:text-gray-900">
              Search
            </Link>
            <Link href="/api-test-full" className="text-gray-600 hover:text-gray-900">
              API Test
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
