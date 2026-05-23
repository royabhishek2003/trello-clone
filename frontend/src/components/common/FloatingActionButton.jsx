import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

export const FloatingActionButton = ({ onClick, icon: Icon = Plus, className = '' }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-40 md:hidden ${className}`}
    >
      <Button 
        onClick={onClick} 
        className="w-14 h-14 rounded-full shadow-lg bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center p-0"
      >
        <Icon className="w-6 h-6" />
      </Button>
    </motion.div>
  );
};
