"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

type AlertType = "success" | "error" | "warning";

interface AlertMessage {
  id: number;
  type: AlertType;
  title: string;
  message: string;
}

interface AlertContextType {
  showAlert: (type: AlertType, title: string, message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const showAlert = (type: AlertType, title: string, message: string) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000); // Auto dismiss after 5 seconds
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 min-w-[320px]">
        <AnimatePresence>
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="relative"
            >
              <Alert
                variant={alert.type === "success" ? "default" : "destructive"}
                className={`
                  ${alert.type === "success" && "border-green-500 text-green-700 dark:text-green-300"}
                  ${alert.type === "warning" && "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30"}
                  ${alert.type === "error" && "border-red-500"}
                `}
              >
                <div className="flex items-start gap-2">
                  {alert.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {alert.type === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  {alert.type === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                  <div>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </div>
                </div>
                <button
                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
} 