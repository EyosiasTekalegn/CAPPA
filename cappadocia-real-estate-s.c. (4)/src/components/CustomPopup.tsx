import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, CheckCircle, HelpCircle, X, ShieldAlert, BadgeInfo } from "lucide-react";

interface CustomPopupProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: "alert" | "confirm";
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomPopup({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onCancel,
  confirmText = "Acknowledge",
  cancelText = "Cancel",
}: CustomPopupProps) {
  // Determine color scheme based on the title/message context
  const titleLower = title.toLowerCase();
  const msgLower = message.toLowerCase();

  const isDanger = 
    titleLower.includes("delete") || 
    titleLower.includes("remove") || 
    titleLower.includes("discard") ||
    msgLower.includes("irreversible") ||
    msgLower.includes("delete");

  const isSuccess = 
    titleLower.includes("sent") || 
    titleLower.includes("saved") || 
    titleLower.includes("success") || 
    titleLower.includes("registered") ||
    titleLower.includes("scheduled") ||
    msgLower.includes("thank you");

  const isInfo = 
    titleLower.includes("limit") || 
    titleLower.includes("timeout") || 
    titleLower.includes("session");

  // Aesthetic mapping based on semantic intent
  let themeColor = "from-red-700 to-red-700 bg-red-600 hover:bg-red-700 shadow-red-600/20 text-[#DC2626]";
  let iconBg = "bg-red-500/10 text-red-600 dark:text-red-400";
  let ambientGlow = "bg-red-600/10";
  let accentBorder = "border-t-4 border-t-red-600";
  let statusIcon = <ShieldAlert className="w-7 h-7" />;

  if (isSuccess) {
    themeColor = "from-[#003B95] to-blue-800 bg-[#003B95] hover:bg-blue-850 shadow-blue-900/20 text-[#003B95]";
    iconBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    ambientGlow = "bg-emerald-500/5";
    accentBorder = "border-t-4 border-t-emerald-500";
    statusIcon = <CheckCircle className="w-7 h-7" />;
  } else if (isInfo) {
    themeColor = "from-[#1D4180] to-blue-900 bg-[#1D4180] hover:bg-blue-900 shadow-blue-800/20 text-[#1D4180]";
    iconBg = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    ambientGlow = "bg-blue-500/5";
    accentBorder = "border-t-4 border-t-[#1D4180]";
    statusIcon = <BadgeInfo className="w-7 h-7" />;
  } else if (isDanger) {
    themeColor = "from-red-700 to-red-750 bg-red-600 hover:bg-red-700 shadow-red-700/25 text-red-600";
    iconBg = "bg-rose-500/10 text-rose-600 dark:text-rose-400";
    ambientGlow = "bg-rose-500/5";
    accentBorder = "border-t-4 border-t-red-600";
    statusIcon = <AlertCircle className="w-7 h-7" />;
  } else {
    // Default fallback
    themeColor = "from-zinc-800 to-zinc-900 bg-zinc-900 hover:bg-zinc-900 shadow-zinc-900/20 text-zinc-900";
    iconBg = "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
    ambientGlow = "bg-zinc-400/5";
    accentBorder = "border-t-4 border-t-zinc-400 dark:border-t-zinc-700";
    statusIcon = <HelpCircle className="w-7 h-7" />;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop Blur and Darkening Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={type === "alert" ? onConfirm : onCancel}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.92, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 350,
            }}
            className={`relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-10 text-left overflow-hidden flex flex-col gap-5 ${accentBorder}`}
            style={{ 
              animation: "wiggle 6s ease-in-out infinite" 
            }}
          >
            <style>
              {`
                @keyframes wiggle {
                  0%, 100% { transform: rotate(-1deg); }
                  50% { transform: rotate(1deg); }
                }
              `}
            </style>
            
            {/* Dynamic Ambient Background Glow Orb */}
            <div className={`absolute -top-16 -left-16 w-36 h-36 ${ambientGlow} rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-16 -right-16 w-36 h-36 ${ambientGlow} rounded-full blur-3xl pointer-events-none`} />

            {/* Micro-pattern Top Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-50" />

            {/* Header Content */}
            <div className="p-6 pb-2 space-y-4 relative z-10 flex flex-col">
              <div className="flex items-start justify-between">
                {/* Visual Status Indicator Icon */}
                <motion.div 
                  initial={{ scale: 0.5, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                  className={`flex-shrink-0 p-3.5 rounded-2xl ${iconBg} shadow-inner flex items-center justify-center`}
                >
                  {statusIcon}
                </motion.div>

                {/* Dismiss button if alert type */}
                {type === "alert" && (
                  <button
                    onClick={onConfirm}
                    className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Title and Message */}
              <div className="space-y-2 mt-2">
                <motion.h3 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="font-serif font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight"
                >
                  {title}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.18 }}
                  className="text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed font-sans whitespace-pre-wrap selection:bg-red-200 dark:selection:bg-red-950"
                >
                  {message}
                </motion.p>
              </div>
            </div>

            {/* Footer / CTA Controls Area */}
            <div className="px-6 pb-6 pt-2 flex gap-3 justify-end relative z-10 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800/80 rounded-b-3xl">
              {type === "confirm" && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
                >
                  {cancelText}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r ${themeColor} text-white font-sans transition-all shadow-md cursor-pointer`}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
