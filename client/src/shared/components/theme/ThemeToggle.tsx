import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/shared/components/ui/Button";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative"
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark
            ? "rotate-90 scale-0"
            : "rotate-0 scale-100"
        }`}
      />

      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark
            ? "rotate-0 scale-100"
            : "-rotate-90 scale-0"
        }`}
      />
    </Button>
  );
}