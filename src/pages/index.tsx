import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
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
  const [dbStatus, setDbStatus] = useState<{
    success?: boolean;
    message?: string;
    timestamp?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen p-8 font-[family-name:var(--font-geist-sans)]`}>
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Book Review App"
              width={120}
              height={30}
              priority
            />
          </div>

          <nav className="flex space-x-4">
            <Link href="/api-test-full" className="text-blue-600 hover:underline">
              API Test
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to Book Review API</h1>
          <p className="text-lg mb-6">A simple API for managing books and reviews</p>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link
              href="/api-test-full"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
            >
              Go to API Test Page
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
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
      </main>

      <footer className="max-w-4xl mx-auto mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
        <p>© 2023 Book Review API</p>
        <div className="mt-2">
          <Link href="/api-test-full" className="text-blue-500 hover:underline">
            API Test Page
          </Link>
        </div>
      </footer>
    </div>
  );
}
