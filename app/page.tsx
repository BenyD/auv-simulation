"use client";
import Simulation from "@/components/Simulation";
import MotionWrapper from "@/components/ui/MotionWrapper";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Suspense } from "react";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { AlertProvider } from "@/components/ui/AlertProvider";
import { Brain, Cpu } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <MotionWrapper className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800/95 dark:to-gray-950 transition-colors duration-300">
            {/* Header */}
            <motion.header
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed top-0 left-0 right-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 transition-all duration-300"
            >
              <div className="max-w-[2000px] mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center">
                    <Image
                      src="/icon.png"
                      alt="AUV Simulation Logo"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-50 transition-colors duration-300">
                    AUV Simulation
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Powered by
                  </span>
                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-950 rounded text-blue-700 dark:text-blue-300 transition-colors duration-300">
                      <Brain className="w-3.5 h-3.5" />
                      TensorFlow.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-black dark:bg-white rounded text-white dark:text-black transition-colors duration-300">
                      <Cpu className="w-3.5 h-3.5" />
                      Next.js 15
                    </span>
                  </div>
                </div>
              </div>
            </motion.header>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-16 pb-12 h-screen flex flex-col"
            >
              <div className="flex-1 min-h-0">
                <Simulation />
              </div>
            </motion.div>

            {/* Footer */}
            <motion.footer
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/80 transition-all duration-300 z-50"
            >
              <div className="max-w-[2000px] mx-auto px-4 h-12 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Deep Reinforcement Learning Path Planning
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">
                  © {new Date().getFullYear()} Beny Dishon K. All rights
                  reserved.
                </p>
              </div>
            </motion.footer>
            <KeyboardShortcutsDialog />
          </MotionWrapper>
        </Suspense>
      </AlertProvider>
    </ErrorBoundary>
  );
}
