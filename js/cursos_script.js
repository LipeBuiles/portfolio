document.addEventListener("DOMContentLoaded", () => {
    console.log("[cursos_script.js] DOMContentLoaded fired.");
    const cursosGrid = document.getElementById("cursos-grid");
    console.log("[cursos_script.js] Initial cursosGrid:", typeof cursosGrid, cursosGrid);

    const skeletonCards = document.querySelectorAll(".shimmer-skeleton-card");
    const language = localStorage.getItem("language") || "es";
    const minimumSkeletonTime = new Promise(resolve => setTimeout(resolve, 2500));

    fetch("docs/cursos.json")
        .then(async (data) => {
            console.log("[cursos_script.js] Inside .then() - cursosGrid state:", typeof cursosGrid, cursosGrid);
            if (!cursosGrid) {
                console.error("[cursos_script.js] Courses grid not found in .then()! Element with ID 'cursos-grid' might be missing.");
                // Display a message in a fallback element if coursesGrid is null
                const bodyElement = document.body;
                let messageElement = document.getElementById('course-load-message');
                if (!messageElement) {
                    messageElement = document.createElement('p');
                    messageElement.id = 'course-load-message';
                    messageElement.className = 'text-center text-red-500 p-4';
                    // Try to append to a main content area or body
                    const mainContent = document.querySelector('main') || document.body;
                    mainContent.prepend(messageElement);
                }
                messageElement.textContent = language === "es" ? "Contenedor de cursos no encontrado." : "Courses container not found.";
                // Still remove skeletons after minimum time
                await minimumSkeletonTime;
                skeletonCards.forEach(card => card.remove());
                return; // Exit if cursosGrid is not found
            }

            const response = await data.json();
            console.log("[cursos_script.js] Fetched and parsed course data:", response);

            const imageLoadPromises = [];

            response.forEach((curso) => {
                const courseCard = document.createElement("div");
                courseCard.className =
                    "course-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center text-center transition-opacity duration-500 ease-in-out";
                courseCard.style.opacity = "0"; // Initially hidden

                const imageContainer = document.createElement('div');
                imageContainer.className = 'relative w-72 h-72 mb-4'; // Container for image and icon

                const img = document.createElement("img");
                const originalImageUrl = curso.imagen; 
                img.alt = curso.nombre;
                img.className = "w-full h-full object-contain rounded-md";

                const refreshIcon = document.createElement('span');
                refreshIcon.className = 'material-symbols-outlined refresh-icon'; // CSS will style this
                refreshIcon.textContent = 'refresh';
                refreshIcon.title = language === "es" ? "Reintentar cargar imagen original" : "Retry loading original image";
                // Inline styles for critical positioning, rest in CSS
                refreshIcon.style.position = 'absolute';
                refreshIcon.style.top = '50%';
                refreshIcon.style.left = '50%';
                refreshIcon.style.transform = 'translate(-50%, -50%)';
                refreshIcon.style.cursor = 'pointer';
                refreshIcon.style.zIndex = '10';
                refreshIcon.style.display = 'none'; // Initially hidden

                refreshIcon.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    console.log(`[cursos_script.js] Refresh icon clicked. Retrying: ${originalImageUrl}`);
                    refreshIcon.style.display = 'none'; 
                    img.src = ''; // Clear src to help ensure re-fetch if URL is the same
                    img.src = originalImageUrl; 
                });

                imageContainer.appendChild(img);
                imageContainer.appendChild(refreshIcon);
                courseCard.appendChild(imageContainer);
                
                const imagePromise = new Promise((resolve) => {
                    img.onload = () => {
                        if (img.src === originalImageUrl) {
                            console.log(`[cursos_script.js] Original image loaded: ${originalImageUrl}`);
                            refreshIcon.style.display = 'none'; 
                        } else if (img.src.endsWith("img/no_image.png")) {
                            console.log(`[cursos_script.js] Fallback image loaded: ${img.src}`);
                            // If fallback loads, refresh icon (if displayed due to original error) remains visible
                        }
                        courseCard.style.opacity = "1";
                        resolve(); 
                    };

                    img.onerror = () => {
                        if (img.src === originalImageUrl || img.src === '') { 
                            console.warn(`[cursos_script.js] Error loading original image: ${originalImageUrl}. Attempting fallback.`);
                            refreshIcon.style.display = 'block'; 
                            img.src = "img/no_image.png"; 
                        } else if (img.src.endsWith("img/no_image.png")) { 
                            console.error(`[cursos_script.js] CRITICAL: Fallback image also failed to load: ${img.src}`);
                            refreshIcon.style.display = 'block'; 
                            courseCard.style.opacity = "1"; 
                            resolve(); 
                        } else {
                            console.error(`[cursos_script.js] Unknown image error state for src: ${img.src}`);
                            courseCard.style.opacity = "1";
                            resolve();
                        }
                    };
                });
                
                img.src = originalImageUrl; // Initial attempt
                imageLoadPromises.push(imagePromise);

                const title = document.createElement("h3");
                title.className = "text-lg font-semibold mb-2 text-text-dark dark:text-bg-light";
                // Use translated name if available
                title.textContent = language === "en" && curso.nombre_en ? curso.nombre_en : curso.nombre;
                title.setAttribute("data-translate-es", curso.nombre);
                if (curso.nombre_en) {
                    title.setAttribute("data-translate-en", curso.nombre_en);
                }
                courseCard.appendChild(title);

                const approvalDate = document.createElement("p");
                approvalDate.className = "text-xs text-gray-500 dark:text-gray-400 mb-3 flex-grow";
                // Use translated date if available
                approvalDate.textContent = language === "en" && curso.fecha_aprobacion_en ? curso.fecha_aprobacion_en : curso.fecha_aprobacion;
                approvalDate.setAttribute("data-translate-es", curso.fecha_aprobacion);
                if (curso.fecha_aprobacion_en) {
                    approvalDate.setAttribute("data-translate-en", curso.fecha_aprobacion_en);
                }
                courseCard.appendChild(approvalDate);

                if (curso.link && curso.link !== "#") {
                    const certificateLink = document.createElement("a");
                    certificateLink.href = curso.link;
                    certificateLink.target = "_blank";
                    certificateLink.className = "text-primary dark:text-primary/80 hover:underline text-sm";
                    // Add data attributes for translation
                    certificateLink.textContent = language === "es" ? "Ver Certificado" : "View Certificate";
                    certificateLink.setAttribute("data-translate-es", "Ver Certificado");
                    certificateLink.setAttribute("data-translate-en", "View Certificate");
                    courseCard.appendChild(certificateLink);
                }
                console.log("[cursos_script.js] About to append to cursosGrid. State:", typeof cursosGrid, cursosGrid);
                if (cursosGrid) { // Extra check before appendChild
                   cursosGrid.appendChild(courseCard);
                } else {
                   console.error("[cursos_script.js] CRITICAL: cursosGrid became null before appendChild inside forEach!");
                }
            });

            // Wait for all images to load (or fail) AND for the minimum skeleton display time
            await Promise.all([...imageLoadPromises, minimumSkeletonTime]);

            // Remove skeleton cards after data is processed and minimum time has passed
            skeletonCards.forEach(card => card.remove());
            
            // This block is no longer needed as cards are made visible individually
            // console.log("[cursos_script.js] About to querySelectorAll on cursosGrid. State:", typeof cursosGrid, cursosGrid);
            // if (cursosGrid) { 
            //     const allCourseCards = cursosGrid.querySelectorAll(".course-card");
            //     allCourseCards.forEach(card => {
            //         card.style.opacity = "1";
            //     });
            // } else {
            //     console.error("[cursos_script.js] CRITICAL: cursosGrid became null before querySelectorAll!");
            // }
        })
        .catch(async (error) => {
            console.error("[cursos_script.js] Error fetching or processing courses:", error);
            // The following line is to ensure cursosGrid is not the cause of an error *within* catch itself.
            const displayGridInCatch = document.getElementById("cursos-grid"); 
            if (displayGridInCatch) {
                displayGridInCatch.innerHTML = `<p class="text-center col-span-full text-red-500">${
                    language === "es"
                        ? "Error al cargar los cursos. Por favor, inténtalo de nuevo más tarde."
                        : "Error loading courses. Please try again later."
                }</p>`;
            } else {
                // Fallback if even displayGridInCatch can't be found
                let messageElement = document.getElementById('course-load-error-message');
                if (!messageElement) {
                    messageElement = document.createElement('p');
                    messageElement.id = 'course-load-error-message';
                    messageElement.className = 'text-center text-red-500 p-4';
                    const mainContent = document.querySelector('main') || document.body;
                    mainContent.prepend(messageElement);
                }
                messageElement.textContent = language === "es" ? "Error al cargar cursos y contenedor no encontrado." : "Error loading courses and container not found.";
            }
            await minimumSkeletonTime;
            skeletonCards.forEach(card => card.remove());
        });
});

// Function to update text based on selected language
function updateTextContent(lang) {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        } else {
            // Fallback for dynamically generated content like course cards
            const translateKey = lang === "en" ? "data-translate-en" : "data-translate-es";
            if (el.hasAttribute(translateKey)) {
                el.textContent = el.getAttribute(translateKey);
            }
        }
    });

    // Update course card titles and dates specifically
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        const titleElement = card.querySelector('h3[data-translate-es]');
        const dateElement = card.querySelector('p[data-translate-es]');
        const linkElement = card.querySelector('a[data-translate-es]');

        if (titleElement) {
            titleElement.textContent = lang === 'en' && titleElement.dataset.translateEn ? titleElement.dataset.translateEn : titleElement.dataset.translateEs;
        }
        if (dateElement) {
            dateElement.textContent = lang === 'en' && dateElement.dataset.translateEn ? dateElement.dataset.translateEn : dateElement.dataset.translateEs;
        }
        if (linkElement) {
            linkElement.textContent = lang === 'en' && linkElement.dataset.translateEn ? linkElement.dataset.translateEn : linkElement.dataset.translateEs;
        }
    });


    // Update "Ver Certificado" links (if any were missed or are static)
    const certificateLinks = document.querySelectorAll('a.text-primary'); // More generic selector if needed
    certificateLinks.forEach(link => {
        if (link.getAttribute('data-translate-es') === 'Ver Certificado') { // Check if it's a certificate link
            link.textContent = lang === 'es' ? 'Ver Certificado' : 'View Certificate';
        }
    });

    // Update refresh icon titles
    const refreshIcons = document.querySelectorAll('.refresh-icon');
    refreshIcons.forEach(icon => {
        icon.title = lang === "es" ? "Reintentar cargar imagen original" : "Retry loading original image";
    });

    // Update any general messages that might be present
    const courseLoadMessage = document.getElementById('course-load-message');
    if (courseLoadMessage) {
        if (courseLoadMessage.textContent.includes("Contenedor de cursos no encontrado") || courseLoadMessage.textContent.includes("Courses container not found")) {
            courseLoadMessage.textContent = lang === "es" ? "Contenedor de cursos no encontrado." : "Courses container not found.";
        }
    }
    const courseLoadErrorMessage = document.getElementById('course-load-error-message');
    if (courseLoadErrorMessage) {
         if (courseLoadErrorMessage.textContent.includes("Error al cargar los cursos") || courseLoadErrorMessage.textContent.includes("Error loading courses")) {
            const baseEs = "Error al cargar los cursos. Por favor, inténtalo de nuevo más tarde.";
            const baseEn = "Error loading courses. Please try again later.";
            const containerEs = "Error al cargar cursos y contenedor no encontrado.";
            const containerEn = "Error loading courses and container not found.";

            if (courseLoadErrorMessage.textContent.startsWith("Error al cargar los cursos. Por favor") || courseLoadErrorMessage.textContent.startsWith("Error loading courses. Please try")) {
                 courseLoadErrorMessage.textContent = lang === "es" ? baseEs : baseEn;
            } else if (courseLoadErrorMessage.textContent.startsWith("Error al cargar cursos y contenedor no encontrado") || courseLoadErrorMessage.textContent.startsWith("Error loading courses and container not found")) {
                 courseLoadErrorMessage.textContent = lang === "es" ? containerEs : containerEn;
            }
        }
    }
}

// Language toggle buttons
const langEsButton = document.getElementById("lang-es");
const langEnButton = document.getElementById("lang-en");

// Event listeners for language buttons
langEsButton.addEventListener("click", () => {
    localStorage.setItem("language", "es");
    updateTextContent("es");
});

langEnButton.addEventListener("click", () => {
    localStorage.setItem("language", "en");
    updateTextContent("en");
});

// Initial text content update based on saved language
const savedLanguage = localStorage.getItem("language") || "es";
updateTextContent(savedLanguage);

// CV Download Button (if needed on this page, ensure the button ID exists)
const downloadCvButton = document.getElementById('download-cv-button');
if (downloadCvButton) {
    downloadCvButton.addEventListener('click', () => {
        const lang = localStorage.getItem('lang') || 'es';
        const cvPath = lang === 'en' ? 'docs/Juan_Felipe_Builes_CV_Lider_Producto_EN.pdf' : 'docs/Juan_Felipe_Builes_CV_Lider_Producto_ES.pdf';
        window.open(cvPath, '_blank');
    });
}

// Update current year in footer
const currentYearSpan = document.getElementById('currentYear');
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}
