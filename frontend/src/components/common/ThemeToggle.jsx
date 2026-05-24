import React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-36 p-1">
        <Button
          variant="ghost"
          className="w-full justify-start font-normal"
          onClick={() => setTheme('light')}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-normal"
          onClick={() => setTheme('dark')}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-normal"
          onClick={() => setTheme('system')}
        >
          <Laptop className="mr-2 h-4 w-4" />
          System
        </Button>
      </PopoverContent>
    </Popover>
  );
}
