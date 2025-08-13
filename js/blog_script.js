document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear();
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = currentYear;
    }

    // Blog posts functionality
    const blogPostsContainer = document.getElementById('blog-posts-container');
    const searchInput = document.getElementById('blog-search');
    const clearSearchButton = document.getElementById('clear-search');
    const searchResultsInfo = document.getElementById('search-results-info');
    const searchResultsCount = document.getElementById('search-results-count');
    const noResultsMessage = document.getElementById('no-results-message');
    let allPosts = [];
    let filteredPosts = [];

    // Function to format date string (YYYY-MM-DD) into a localized, readable format
    function getFormattedDate(dateString, lang) {
        const date = new Date(dateString + 'T00:00:00'); // Ensure correct parsing as local date
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', options);
    }

    async function fetchBlogPosts() {
        try {
            const response = await fetch('docs/blog.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allPosts = await response.json();
            allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date DESC
            filteredPosts = [...allPosts]; // Initialize filtered posts with all posts
            renderFilteredPosts(localStorage.getItem('language') || 'es');
        } catch (error) {
            console.error("Could not fetch blog posts:", error);
            if (blogPostsContainer) {
                blogPostsContainer.innerHTML = '<p class="text-center text-red-500">Error al cargar los posts. Intenta de nuevo más tarde.</p>';
            }
        }
    }

    function renderBlogPosts(lang) {
        filteredPosts = [...allPosts];
        renderFilteredPosts(lang, '');
    }

    // Function to highlight search terms
    function highlightSearchTerm(text, searchTerm) {
        if (!searchTerm.trim()) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 dark:text-black rounded px-1">$1</mark>');
    }

    // Enhanced search functionality with better matching
    function performSearch(query) {
        const lang = localStorage.getItem('language') || 'es';
        
        if (!query.trim()) {
            filteredPosts = [...allPosts];
            if (searchResultsInfo) searchResultsInfo.classList.add('hidden');
            if (clearSearchButton) clearSearchButton.classList.add('hidden');
        } else {
            const searchTerms = query.toLowerCase().trim().split(/\s+/);
            
            filteredPosts = allPosts.filter(post => {
                const title = lang === 'en' ? post.titleEn : post.titleEs;
                const summary = lang === 'en' ? post.summaryEn : post.summaryEs;
                const searchableContent = (title + ' ' + summary).toLowerCase();
                
                // Check if all search terms are found in the content
                return searchTerms.every(term => searchableContent.includes(term));
            });
            
            // Show/hide search results info
            if (searchResultsCount && searchResultsInfo) {
                const resultsText = translations[lang]['blog.resultados'] || 'resultado(s) encontrado(s)';
                searchResultsCount.textContent = `${filteredPosts.length} ${resultsText}`;
                searchResultsInfo.classList.remove('hidden');
            }
            if (clearSearchButton) clearSearchButton.classList.remove('hidden');
        }
        
        renderFilteredPosts(lang, query.trim());
    }

    function renderFilteredPosts(lang, searchTerm = '') {
        if (!blogPostsContainer) return;

        blogPostsContainer.innerHTML = '';
        
        if (filteredPosts.length === 0) {
            if (noResultsMessage) noResultsMessage.classList.remove('hidden');
        } else {
            if (noResultsMessage) noResultsMessage.classList.add('hidden');
            
            filteredPosts.forEach(post => {
                const article = document.createElement('article');
                article.className = 'bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6';

                const title = lang === 'en' ? post.titleEn : post.titleEs;
                const summary = lang === 'en' ? post.summaryEn : post.summaryEs;
                const imageAlt = lang === 'en' ? post.imageAltEn : post.imageAltEs;
                const formattedDate = getFormattedDate(post.date, lang);
                
                const publicationDateLabelText = translations[lang]['blog.publicationDateLabel'] || (lang === 'en' ? 'Publication date:' : 'Fecha de publicación:');
                const readMoreText = translations[lang]['blog.leerMas'] || (lang === 'en' ? 'Read more &rarr;' : 'Leer más &rarr;');

                // Highlight search terms in title and summary
                const highlightedTitle = highlightSearchTerm(title, searchTerm);
                const highlightedSummary = highlightSearchTerm(summary, searchTerm);

                article.innerHTML = `
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="md:w-5/6">
                            <h2 class="text-2xl font-semibold mb-2">
                                <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                                    ${highlightedTitle}
                                </a>
                            </h2>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">
                                <span>${publicationDateLabelText}</span> ${formattedDate}
                            </p>
                            <p class="text-text-dark dark:text-bg-light">${highlightedSummary}</p>
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
        }
        
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
        
        // Preserve current search state
        const currentSearch = searchInput ? searchInput.value : '';
        if (currentSearch.trim()) {
            performSearch(currentSearch); // Re-search with current query in new language
        } else {
            renderBlogPosts(lang); // Re-render all posts with the new language
        }

        // Update button styles
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
    
    // Search event listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(e.target.value);
            }
        });
    }

    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            performSearch('');
        });
    }

    // Language button event listeners
    if (langEsButton) {
        langEsButton.addEventListener('click', () => setLanguage('es'));
    }
    if (langEnButton) {
        langEnButton.addEventListener('click', () => setLanguage('en'));
    }

    // Initial setup
    fetchBlogPosts().then(() => {
        const currentLang = localStorage.getItem('language') || 'es';
        setLanguage(currentLang); 
    });
});
