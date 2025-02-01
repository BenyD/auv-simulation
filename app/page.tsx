import Simulation from "@/components/Simulation";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[2000px] mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            AUV Simulator
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Built with
            </span>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-700 dark:text-blue-300">
                TensorFlow.js
              </span>
              <span className="px-2 py-1 bg-black dark:bg-white rounded text-white dark:text-black">
                Next.js
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 pb-12 h-screen flex flex-col">
        <div className="flex-1 min-h-0">
          <Simulation />
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[2000px] mx-auto px-4 h-12 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Deep Reinforcement Learning Path Planning
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Beny Dishon K. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
