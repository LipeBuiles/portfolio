document.addEventListener('DOMContentLoaded', () => {
            const currentYear = new Date().getFullYear();
            const yearSpan = document.getElementById('currentYear');
            if (yearSpan) {
                yearSpan.textContent = currentYear;
            }

            // Theme toggle logic is now handled by the main script.js
            // const themeToggle = document.getElementById('theme-toggle');
            // const lightIcon = document.getElementById('theme-toggle-light-icon');
            // const darkIcon = document.getElementById('theme-toggle-dark-icon');

            // const applyTheme = (theme) => {
            //     if (theme === 'dark') {
            //         document.documentElement.classList.add('dark');
            //         if (lightIcon) lightIcon.classList.remove('hidden');
            //         if (darkIcon) darkIcon.classList.add('hidden');
            //     } else {
            //         document.documentElement.classList.remove('dark');
            //         if (lightIcon) lightIcon.classList.add('hidden');
            //         if (darkIcon) darkIcon.classList.remove('hidden');
            //     }
            // };

            // const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            // applyTheme(savedTheme);

            // if (themeToggle) {
            //     themeToggle.addEventListener('click', () => {
            //         const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            //         localStorage.setItem('theme', newTheme);
            //         applyTheme(newTheme);
            //     });
            // }

            // Blog posts functionality
            const blogPostsContainer = document.getElementById('blog-posts-container');
            let allPosts = [];

            // Function to format date string (YYYY-MM-DD) into a localized, readable format
            function getFormattedDate(dateString, lang) {
                const date = new Date(dateString + 'T00:00:00'); // Ensure correct parsing as local date
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', options);
            }

            async function fetchBlogPosts() {
                try {
                    const response = await fetch('docs/blog.json'); // Corrected filename
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    allPosts = await response.json();
                    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date DESC
                    renderBlogPosts(localStorage.getItem('language') || 'es');
                } catch (error) {
                    console.error("Could not fetch blog posts:", error);
                    if (blogPostsContainer) {
                        blogPostsContainer.innerHTML = '<p class="text-center text-red-500">Error al cargar los posts. Intenta de nuevo más tarde.</p>';
                    }
                }
            }

            function renderBlogPosts(lang) {
                if (!blogPostsContainer || !allPosts.length) return;

                blogPostsContainer.innerHTML = ''; // Clear existing posts

                allPosts.forEach(post => {
                    const article = document.createElement('article');
                    // Preserving original classes for the article element as per blog.html structure
                    article.className = 'bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6';
                    // data-aos attribute can be added if AOS library is in use and initialized elsewhere
                    // article.setAttribute('data-aos', 'fade-up'); 

                    const title = lang === 'en' ? post.titleEn : post.titleEs;
                    const summary = lang === 'en' ? post.summaryEn : post.summaryEs;
                    const imageAlt = lang === 'en' ? post.imageAltEn : post.imageAltEs;
                    const formattedDate = getFormattedDate(post.date, lang);
                    
                    const publicationDateLabelText = translations[lang]['blog.publicationDateLabel'] || (lang === 'en' ? 'Publication date:' : 'Fecha de publicación:');
                    const readMoreText = translations[lang]['blog.leerMas'] || (lang === 'en' ? 'Read more &rarr;' : 'Leer más &rarr;');

                    // Replicating the original HTML structure for each post
                    article.innerHTML = `
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="md:w-5/6">
                                <h2 class="text-2xl font-semibold mb-2">
                                    <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                                        ${title}
                                </a>
                                </h2>
                                <p class="text-gray-600 dark:text-gray-400 mb-4">
                                    <span>${publicationDateLabelText}</span> ${formattedDate}
                                </p>
                                <p class="text-text-dark dark:text-bg-light">${summary}</p>
                                <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 text-accent hover:underline">
                                    ${readMoreText}
                                </a>
                            </div>
                            <div class="md:w-1/6 blog-post-image-container">
                                <img src="${post.image}" alt="${imageAlt}" class="rounded-lg shadow-md blog-post-image" style="${post.imageStyle}">
                            </div>
                        </div>
                    `;
                    blogPostsContainer.appendChild(article);
                });
                // It's important that updateTranslations is called AFTER posts are rendered if it affects static text on the page.
                // However, since we are injecting translated content directly, this might only be needed for other static elements.
                if (typeof updateTranslations === 'function') {
                    updateTranslations(lang);
                }
            }

            // Language toggle
            const langEsButton = document.getElementById('lang-es');
            const langEnButton = document.getElementById('lang-en');

            const setLanguage = (lang) => {
                localStorage.setItem('language', lang);
                if (typeof updateTranslations === 'function') {
                     updateTranslations(lang); // Update static text first
                }
                renderBlogPosts(lang); // Re-render blog posts with the new language

                // Update button styles (ensure these classes match your Tailwind config and HTML)
                if (lang === 'es') {
                    if (langEsButton) {
                        langEsButton.classList.remove('bg-gray-200', 'text-text-dark', 'dark:bg-gray-700', 'dark:text-bg-light');
                        langEsButton.classList.add('bg-primary', 'text-white');
                    }
                    if (langEnButton) {
                        langEnButton.classList.remove('bg-primary', 'text-white');
                        langEnButton.classList.add('bg-gray-200', 'text-text-dark', 'dark:bg-gray-700', 'dark:text-bg-light');
                    }
                } else { // lang === 'en'
                    if (langEnButton) {
                        langEnButton.classList.remove('bg-gray-200', 'text-text-dark', 'dark:bg-gray-700', 'dark:text-bg-light');
                        langEnButton.classList.add('bg-primary', 'text-white');
                    }
                    if (langEsButton) {
                        langEsButton.classList.remove('bg-primary', 'text-white');
                        langEsButton.classList.add('bg-gray-200', 'text-text-dark', 'dark:bg-gray-700', 'dark:text-bg-light');
                    }
                }
            };
            
            // Initial setup
            fetchBlogPosts().then(() => {
                const currentLang = localStorage.getItem('language') || 'es';
                setLanguage(currentLang); 
            });

            if (langEsButton) {
                langEsButton.addEventListener('click', () => setLanguage('es'));
            }
            if (langEnButton) {
                langEnButton.addEventListener('click', () => setLanguage('en'));
            }
        });
