document.addEventListener('DOMContentLoaded', () => {
    const langEsButton = document.getElementById('lang-es');
    const langEnButton = document.getElementById('lang-en');
    const htmlEl = document.documentElement; // Get the <html> element

    // Function to update texts based on selected language
    function updateTexts(lang) {
        document.querySelectorAll('[data-translate]').forEach(el => {
            const fullKey = el.getAttribute('data-translate'); // e.g., "nav.inicio" or "habilidades.blandas.lista.list"
            let textToSet;
            let isList = false;
            let actualKey = fullKey;

            // Check if the key indicates a list that needs special formatting
            if (fullKey.endsWith('.list')) {
                actualKey = fullKey.substring(0, fullKey.lastIndexOf('.list')); // e.g., "habilidades.blandas.lista"
                isList = true;
            }

            // Access the translation directly using the actualKey from the global translations object
            if (translations[lang] && translations[lang].hasOwnProperty(actualKey)) {
                textToSet = translations[lang][actualKey];
            }

            if (textToSet !== undefined) {
                if (isList && Array.isArray(textToSet)) {
                    el.innerHTML = textToSet.map(item => `<li>${item}</li>`).join('');
                } else if (typeof textToSet === 'string') {
                    // Use existing logic for determining whether to use innerHTML or textContent
                    if (actualKey.includes('descripcion') || actualKey.includes('subtitulo') || actualKey.includes('derechos') || (el.tagName === 'STRONG' && el.parentElement.dataset.translate)) {
                        el.innerHTML = textToSet;
                    } else {
                        el.textContent = textToSet;
                    }
                }
            } else {
                console.warn(`Translation not found for key: ${fullKey} (resolved to ${actualKey}) in language: ${lang}`);
            }
        });
        htmlEl.setAttribute('lang', lang); // Update the lang attribute of the <html> tag
    }

    // Function to set the language
    function setLanguage(lang) {
        updateTexts(lang);
        if (lang === 'es') {
            langEsButton.classList.add('bg-primary', 'text-white');
            langEsButton.classList.remove('bg-gray-200', 'text-text-dark');
            langEnButton.classList.add('bg-gray-200', 'text-text-dark');
            langEnButton.classList.remove('bg-primary', 'text-white');
        } else {
            langEnButton.classList.add('bg-primary', 'text-white');
            langEnButton.classList.remove('bg-gray-200', 'text-text-dark');
            langEsButton.classList.add('bg-gray-200', 'text-text-dark');
            langEsButton.classList.remove('bg-primary', 'text-white');
        }
        localStorage.setItem('preferredLang', lang);
    }

    // Event listeners for language buttons
    langEsButton.addEventListener('click', () => setLanguage('es'));
    langEnButton.addEventListener('click', () => setLanguage('en'));

    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800, // Animation duration
        once: false, // Animation happens every time you scroll
    });

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // Close mobile menu after clicking a link
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Dynamic year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Swiper initialization for testimonials
    new Swiper('.progress-slide-carousel', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'progressbar',
        },
        slidesPerView: 1,
        spaceBetween: 20,
    });

    // Project Modal Functionality
    const projectModal = document.getElementById('project-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const modalProjectDescription = document.getElementById('modal-project-description');

    document.querySelectorAll('.open-project-modal').forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.dataset.projectId;
            const projectContainer = document.getElementById(projectId);
            if (projectContainer) {
                const descriptionHtml = projectContainer.querySelector('.project-description-container .project-description').innerHTML;
                modalProjectDescription.innerHTML = descriptionHtml;
                projectModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            }
        });
    });

    closeModalButton.addEventListener('click', () => {
        projectModal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore background scroll
    });

    // Close modal when clicking outside of it
    projectModal.addEventListener('click', (event) => {
        if (event.target === projectModal) {
            projectModal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore background scroll
        }
    });

    // Load preferred language from localStorage or default to 'es'
    const preferredLang = localStorage.getItem('preferredLang') || 'es';
    setLanguage(preferredLang);

});