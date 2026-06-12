import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, X, ChevronUp } from 'lucide-react';

interface ContactDropdownProps {
  isDarkMode: boolean;
  globalSocials: any;
  contactInfo: { phone: string; email: string };
}

export default function ContactDropdown({ isDarkMode, globalSocials, contactInfo }: ContactDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    { 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-[18px] h-[18px] sm:w-5 sm:h-5 object-contain" referrerPolicy="no-referrer" />, 
      label: 'WhatsApp', 
      href: globalSocials?.whatsapp || '#', 
      color: 'hover:scale-105 transition-transform' 
    },
    { 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Email" className="w-[18px] h-[18px] sm:w-5 sm:h-5 object-contain" referrerPolicy="no-referrer" />, 
      label: 'Email', 
      href: contactInfo ? `mailto:${contactInfo.email}` : '#', 
      color: 'hover:scale-105 transition-transform' 
    },
    { 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" className="w-[18px] h-[18px] sm:w-5 sm:h-5 object-contain" referrerPolicy="no-referrer" />, 
      label: 'Telegram', 
      href: globalSocials?.telegram || '#', 
      color: 'hover:scale-105 transition-transform' 
    },
    { 
      icon: <Phone className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-700 dark:text-zinc-300" />, 
      label: 'Call Us', 
      href: contactInfo ? `tel:${contactInfo.phone}` : '#', 
      color: 'bg-zinc-100 dark:bg-zinc-800/80 hover:scale-105 transition-transform' 
    },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-2 rounded-2xl shadow-xl flex flex-col gap-1 min-w-[170px] sm:min-w-[190px]"
          >
            {contactOptions.map((opt) => (
              <a
                key={opt.label}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-800 dark:text-zinc-100 text-xs font-semibold tracking-wide capitalize"
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${opt.color}`}>
                  {opt.icon}
                </div>
                <span>{opt.label}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300"
        aria-label="Contact options"
      >
        {isOpen ? <X className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>
    </div>
  );
}
