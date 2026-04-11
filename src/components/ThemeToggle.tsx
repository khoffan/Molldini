import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
    const [isDark, setIsDark] = useState<boolean>(() => {
        // 1. Check localStorage first
        const saved = localStorage.getItem("theme");
        if (saved) return saved === "dark";
        // 2. Fall back to OS preference
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            data-tooltip-id="molldini-tooltip"
            data-tooltip-content="theme"
            className="p-2 bg-surface-hover rounded-full hover:bg-primary-light transition-all cursor-pointer focus:outline-none"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className="h-5 w-5 text-yellow-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
                <Moon className="h-5 w-5 text-muted transition-transform duration-300 hover:-rotate-12" />
            )}
        </button>
    );
}

export default ThemeToggle;
