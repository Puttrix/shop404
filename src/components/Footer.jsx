export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
        <div>
          © {new Date().getFullYear()} Shop404. For testing only.
        </div>
        <div className="flex items-center gap-4">
          <a href="/privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy</a>
          <a href="/terms" className="hover:text-gray-900 dark:hover:text-white">Terms</a>
        </div>
      </div>
    </footer>
  );
}
