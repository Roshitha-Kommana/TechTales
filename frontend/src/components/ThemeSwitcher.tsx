import React, { useState, useRef, useEffect } from 'react';

// Theme definitions - will expand as user provides more themes
export interface ThemeOption {
    id: string;
    name: string;
    file: string;
    preview: {
        bg: string;
        primary: string;
        accent: string;
    };
}

// Currently available themes
export const themes: ThemeOption[] = [
    {
        id: 'default',
        name: 'Default',
        file: 'theme-default.css',
        preview: { bg: '#F8EDD8', primary: '#2B6777', accent: '#C8553D' },
    },
    {
        id: 'velvet',
        name: 'Velvet Cream',
        file: 'theme-velvet.css',
        preview: { bg: '#FFF6E7', primary: '#8C2F3A', accent: '#E6DCCF' },
    },
    {
        id: 'bw',
        name: 'Black & White',
        file: 'theme-bw.css',
        preview: { bg: '#060D0C', primary: '#FCF8F0', accent: '#333333' },
    },
    {
        id: 'purple',
        name: 'Purple',
        file: 'theme-purple.css',
        preview: { bg: '#3A345B', primary: '#BA2BA4', accent: '#D183A9' },
    },
    {
        id: 'urban',
        name: 'Urban Nature',
        file: 'theme-urban.css',
        preview: { bg: '#F4F8F5', primary: '#356B80', accent: '#FFBF00' },
    },
    {
        id: 'flower',
        name: 'Flower Shop',
        file: 'theme-flower.css',
        preview: { bg: '#FFAFEB', primary: '#7758A3', accent: '#DB3E8C' },
    },
    {
        id: 'retro',
        name: 'Retro Oasis',
        file: 'theme-retro.css',
        preview: { bg: '#FDF6EC', primary: '#6398A9', accent: '#D7897F' },
    },
    {
        id: 'pantone',
        name: 'Pantone',
        file: 'theme-pantone.css',
        preview: { bg: '#F0EFEB', primary: '#87B4D5', accent: '#A494AA' },
    },
];

const STORAGE_KEY = 'techtales-theme';

// Load theme by changing the stylesheet
export const loadTheme = (themeId: string): void => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    // Find or create the theme link element
    let themeLink = document.getElementById('theme-style') as HTMLLinkElement;

    if (!themeLink) {
        themeLink = document.createElement('link');
        themeLink.id = 'theme-style';
        themeLink.rel = 'stylesheet';
        document.head.appendChild(themeLink);
    }

    // Set the href to the theme file
    themeLink.href = `/themes/${theme.file}`;

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, themeId);
};

// Get current theme from localStorage
export const getCurrentTheme = (): string => {
    return localStorage.getItem(STORAGE_KEY) || 'default';
};

// Initialize theme on app load
export const initializeTheme = (): void => {
    const savedTheme = getCurrentTheme();
    if (savedTheme !== 'default') {
        loadTheme(savedTheme);
    }
};

const ThemeSwitcher: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleThemeSelect = (themeId: string) => {
        loadTheme(themeId);
        setCurrentTheme(themeId);
        setIsOpen(false);
    };

    const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

    return (
        <div ref={dropdownRef} className="relative">
            {/* Theme Button - Simple and Minimal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 min-h-[44px]"
                title="Change Color Profile"
            >
                {/* Color preview circles */}
                <div className="flex items-center gap-1">
                    <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: currentThemeData.preview.bg }}
                    />
                    <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: currentThemeData.preview.primary }}
                    />
                </div>
                <span className="font-medium text-sm flex-1 text-left">Theme</span>
                <span className="text-xs text-gray-500">▼</span>
            </button>

            {/* Dropdown Menu - Minimal Design with Scroll */}
            {isOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] overflow-hidden">
                    <div className="py-1 max-h-60 overflow-y-auto scrollbar-ui">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeSelect(theme.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${currentTheme === theme.id ? 'bg-gray-100' : ''
                                    }`}
                            >
                                {/* Color preview */}
                                <div className="flex items-center gap-1">
                                    <div
                                        className="w-3.5 h-3.5 rounded-full border border-gray-200"
                                        style={{ backgroundColor: theme.preview.bg }}
                                        title="Background"
                                    />
                                    <div
                                        className="w-3.5 h-3.5 rounded-full border border-gray-200"
                                        style={{ backgroundColor: theme.preview.primary }}
                                        title="Primary"
                                    />
                                    <div
                                        className="w-3.5 h-3.5 rounded-full border border-gray-200"
                                        style={{ backgroundColor: theme.preview.accent }}
                                        title="Accent"
                                    />
                                </div>
                                <span className="text-sm text-gray-800">{theme.name}</span>
                                {currentTheme === theme.id && (
                                    <span className="ml-auto text-green-500 text-sm">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
