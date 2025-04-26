document.addEventListener('DOMContentLoaded', function() {

    try {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50,
            easing: 'ease-in-out',
        });
    } catch (e) {
        console.error("Error inicializando AOS:", e);
    }

    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = currentYear;
    } else {
        console.warn("Elemento con ID 'currentYear' no encontrado en el footer.");
    }

    // Manejo del formulario de contacto con Fetch API
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status'); // Elemento para mostrar mensajes

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevenir el envío normal del formulario

            const formData = new FormData(contactForm);
            formStatus.innerHTML = 'Enviando...'; // Mensaje mientras se envía
            formStatus.className = 'mt-4 text-center text-gray-600'; // Estilo base

            fetch('https://formspree.io/f/xvgagknl', { // <-- ¡¡REEMPLAZA ESTO!!
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    formStatus.innerHTML = '¡Gracias! Tu mensaje ha sido enviado.';
                    formStatus.className = 'mt-4 text-center text-green-600'; // Estilo éxito
                    contactForm.reset(); // Limpiar el formulario
                } else {
                    // Intentar obtener más detalles del error si el servidor los envía en JSON
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            formStatus.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                        } else {
                            formStatus.innerHTML = 'Hubo un problema al enviar tu mensaje. Intenta de nuevo.';
                        }
                        formStatus.className = 'mt-4 text-center text-red-600'; // Estilo error
                    }).catch(error => {
                        // Si la respuesta no es JSON o hay otro error
                        formStatus.innerHTML = 'Hubo un problema al enviar tu mensaje. Intenta de nuevo.';
                        formStatus.className = 'mt-4 text-center text-red-600'; // Estilo error
                    });
                }
            }).catch(error => {
                // Error de red u otro problema con fetch
                console.error('Error en fetch:', error);
                formStatus.innerHTML = 'Hubo un problema de conexión al enviar tu mensaje. Revisa tu conexión e intenta de nuevo.';
                formStatus.className = 'mt-4 text-center text-red-600'; // Estilo error
            });
        });
    } else {
        if (!contactForm) console.warn("Elemento con ID 'contact-form' no encontrado.");
        if (!formStatus) console.warn("Elemento con ID 'form-status' no encontrado.");
    }

    // --- Lógica del Modal de Proyectos ---

    const modal = document.getElementById('project-modal');
    const modalDescriptionContainer = document.getElementById('modal-project-description');
    const closeModalButton = document.getElementById('close-modal-button');
    const openModalButtons = document.querySelectorAll('.open-project-modal');

    // Función para abrir el modal
    function openModal(projectId) {
        const projectElement = document.getElementById(projectId);
        if (!projectElement || !modal || !modalDescriptionContainer) {
            console.error('Elementos del modal o del proyecto no encontrados para:', projectId);
            return;
        }

        const descriptionContentElement = projectElement.querySelector('.project-description');

        if (!descriptionContentElement) {
             console.error('Contenido de descripción no encontrado dentro de:', projectId);
            return;
        }

        // Poblar el modal
        modalDescriptionContainer.innerHTML = '';
        modalDescriptionContainer.innerHTML = descriptionContentElement.innerHTML;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Función para cerrar el modal
    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            // Limpiar contenido para la próxima vez
            if(modalDescriptionContainer) modalDescriptionContainer.innerHTML = '';
        }
    }

    // Event listeners para los botones "Ver más"
    openModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.dataset.projectId;
            openModal(projectId);
        });
    });

    // Event listener para el botón de cerrar
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    // Event listener para cerrar haciendo clic fuera del contenido del modal (en el overlay)
    if (modal) {
        modal.addEventListener('click', function(event) {
            // Si el clic fue directamente sobre el fondo (overlay) y no sobre el contenido
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    // Event listener para cerrar con la tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // --- Fin Lógica del Modal ---

});