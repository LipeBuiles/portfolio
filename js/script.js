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
});