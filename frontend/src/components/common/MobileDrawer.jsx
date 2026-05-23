import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

export const MobileDrawer = ({ isOpen, onClose, children, title }) => {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-background shadow-xl z-50 md:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-4 border-b">
              {title && <h2 className="font-semibold text-lg">{title}</h2>}
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
                <span className="sr-only">Close drawer</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 touch-pan-y">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
