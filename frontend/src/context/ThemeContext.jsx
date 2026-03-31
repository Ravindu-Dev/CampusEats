import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();
// Use VITE_API_URL if available, which already includes /api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('app-theme') || 'default');
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('dark-mode') === 'true');

    // Initial load: Fetch global theme from backend
    useEffect(() => {
        const fetchGlobalTheme = async () => {
            try {
                // API_BASE_URL already includes /api, so we just append /theme
                const response = await axios.get(`${API_BASE_URL}/theme`);
                console.log('Fetched global theme:', response.data);
                const theme = response.data.theme;
                if (theme) {
                    setCurrentTheme(theme);
                    localStorage.setItem('app-theme', theme);
                }
            } catch (error) {
                console.error('Failed to fetch global theme:', error);
            }
        };

        fetchGlobalTheme();
    }, []);

    // Apply classes to root element
    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove old theme classes
        const themeClasses = ['theme-christmas', 'theme-valentine', 'theme-halloween', 'theme-summer', 'theme-monsoon', 'theme-ramadan', 'theme-new-year', 'theme-sinhala-tamil-new-year'];
        root.classList.remove(...themeClasses);
        
        // Add current theme class
        if (currentTheme !== 'default' && currentTheme !== 'dark') {
            root.classList.add(`theme-${currentTheme}`);
        }

        // Handle dark mode
        if (isDarkMode || currentTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('app-theme', currentTheme);
        localStorage.setItem('dark-mode', isDarkMode);
    }, [currentTheme, isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const updateGlobalTheme = async (themeName) => {
        try {
            const token = localStorage.getItem('adminToken'); // Admins use adminToken
            // API_BASE_URL already includes /api, so we just append /admin/theme
            await axios.post(
                `${API_BASE_URL}/admin/theme`,
                { theme: themeName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrentTheme(themeName);
        } catch (error) {
            console.error('Failed to update global theme:', error);
            throw error;
        }
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, isDarkMode, toggleDarkMode, updateGlobalTheme, setCurrentTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
