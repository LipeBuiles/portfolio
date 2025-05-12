document.addEventListener('DOMContentLoaded', () => {
            const currentYear = new Date().getFullYear();
            const yearSpan = document.getElementById('currentYear');
            if (yearSpan) {
                yearSpan.textContent = currentYear;
            }

            // Theme toggle
            const themeToggle = document.getElementById('theme-toggle');
            const lightIcon = document.getElementById('theme-toggle-light-icon');
            const darkIcon = document.getElementById('theme-toggle-dark-icon');

            const applyTheme = (theme) => {
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    if (lightIcon) lightIcon.classList.remove('hidden'); // Show light_mode icon when dark
                    if (darkIcon) darkIcon.classList.add('hidden');    // Hide dark_mode icon when dark
                } else {
                    document.documentElement.classList.remove('dark');
                    if (lightIcon) lightIcon.classList.add('hidden');    // Hide light_mode icon when light
                    if (darkIcon) darkIcon.classList.remove('hidden'); // Show dark_mode icon when light
                }
            };

            const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            applyTheme(savedTheme);

            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    applyTheme(newTheme);
                });
            }

            // Language toggle (basic, assumes locales.js handles the actual translation logic)
            const langEsButton = document.getElementById('lang-es');
            const langEnButton = document.getElementById('lang-en');
            
            const setLanguage = (lang) => {
                localStorage.setItem('language', lang);
                updateTranslations(lang); // This function should be in your locales.js or script.js
                if (lang === 'es') {
                    if (langEsButton) langEsButton.classList.replace('bg-gray-200', 'bg-primary');
                    if (langEsButton) langEsButton.classList.replace('text-text-dark', 'text-white');
                    if (langEnButton) langEnButton.classList.replace('bg-primary', 'bg-gray-200');
                    if (langEnButton) langEnButton.classList.replace('text-white', 'text-text-dark');
                } else {
                    if (langEnButton) langEnButton.classList.replace('bg-gray-200', 'bg-primary');
                    if (langEnButton) langEnButton.classList.replace('text-text-dark', 'text-white');
                    if (langEsButton) langEsButton.classList.replace('bg-primary', 'bg-gray-200');
                    if (langEsButton) langEsButton.classList.replace('text-white', 'text-text-dark');
                }
            };

            const currentLang = localStorage.getItem('language') || 'es';
            setLanguage(currentLang);

            if (langEsButton) {
                langEsButton.addEventListener('click', () => setLanguage('es'));
            }
            if (langEnButton) {
                langEnButton.addEventListener('click', () => setLanguage('en'));
            }
        });
