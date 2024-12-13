// Configuración de la API
const API_BASE_URL = 'http://localhost:8080/v1/tecnicos';

// Elementos del DOM
const form = document.getElementById('empleadoForm');
const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');
const correoInput = document.getElementById('correo');
const contrasenaInput = document.getElementById('contrasena');
const tipoInput = document.getElementById('tipo');
const empleadosList = document.getElementById('empleadosList');
const messageBox = document.getElementById('message');
const formSubmitButton = form.querySelector('button[type="submit"]');
const cancelEditButton = document.getElementById('cancelEdit');

// Utilidades
class UIUtils {
    // Mostrar mensajes con mejor manejo y accesibilidad
    static showMessage(message, type = 'error') {
        messageBox.className = `message ${type}`;
        messageBox.textContent = message;
        messageBox.setAttribute('aria-live', 'polite');
        messageBox.style.display = 'block';

        // Animación de mensaje mejorada
        requestAnimationFrame(() => {
            messageBox.style.opacity = '1';
            messageBox.style.transform = 'translateY(0)';
        });

        // Ocultar mensaje automáticamente
        setTimeout(() => {
            messageBox.style.opacity = '0';
            messageBox.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                messageBox.style.display = 'none';
                messageBox.removeAttribute('aria-live');
            }, 500);
        }, 3000);
    }

    // Validación de formulario más robusta
    static validateForm(tecnico) {
        const errors = [];

        // Validaciones con mensajes más específicos
        if (!tecnico.nombre || tecnico.nombre.trim().length < 2) {
            errors.push('Nombre inválido: Debe tener al menos 2 caracteres');
        }

        if (!tecnico.apellido || tecnico.apellido.trim().length < 2) {
            errors.push('Apellido inválido: Debe tener al menos 2 caracteres');
        }

        if (!tecnico.correo || !this.isValidEmail(tecnico.correo)) {
            errors.push('Correo electrónico inválido');
        }

        if (!tecnico.contrasena || tecnico.contrasena.length < 8) {
            errors.push('Contraseña inválida: Debe tener al menos 8 caracteres');
        }

        if (!tecnico.tipo) {
            errors.push('Debe seleccionar un tipo de técnico');
        }

        return errors;
    }

    // Validación de email más estricta
    static isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    // Reset del formulario con gestión de estado
    static resetForm() {
        form.reset();
        formSubmitButton.textContent = 'Registrar Empleado';
        form.dataset.modo = 'crear';
        delete form.dataset.correoOriginal;

        // Ocultar botón de cancelar edición
        if (cancelEditButton) {
            cancelEditButton.style.display = 'none';
        }

        // Restaurar eventos originales
        form.removeEventListener('submit', updateSubmitHandler);
        form.addEventListener('submit', submitFormHandler);

        // Restaurar foco
        nombreInput.focus();
    }

    // Habilitar/Deshabilitar controles del formulario
    static toggleFormControls(disabled = false) {
        const formControls = form.querySelectorAll('input, select, button');
        formControls.forEach(control => {
            control.disabled = disabled;
        });
    }
}

// Servicio de API con manejo de errores mejorado
class TecnicoService {
    static async fetchAPI(url, method = 'GET', body = null) {
        try {
            UIUtils.toggleFormControls(true); // Deshabilitar controles durante la solicitud

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            UIUtils.showMessage(`Error: ${error.message}`, 'error');
            throw error;
        } finally {
            UIUtils.toggleFormControls(false); // Rehabilitar controles
        }
    }

    // Métodos de API con manejo de errores similar
    static async obtenerTecnicos() {
        try {
            const data = await this.fetchAPI(API_BASE_URL);
            return data.codigo === 200 ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    static async registrarTecnico(tecnico) {
        return this.fetchAPI(API_BASE_URL, 'POST', tecnico);
    }

    static async actualizarTecnico(correoOriginal, tecnico) {
        return this.fetchAPI(`${API_BASE_URL}/${correoOriginal}`, 'PUT', tecnico);
    }

    static async eliminarTecnico(correo) {
        return this.fetchAPI(`${API_BASE_URL}/${correo}`, 'DELETE');
    }
}

// Renderizado de lista de técnicos con mejoras
async function renderizarTecnicos() {
    try {
        empleadosList.innerHTML = '<div class="loading" aria-busy="true">Cargando técnicos...</div>';
        const tecnicos = await TecnicoService.obtenerTecnicos();

        if (tecnicos.length === 0) {
            empleadosList.innerHTML = `
                <div class="empty-list" aria-live="polite">
                    <p>No hay técnicos registrados</p>
                    <p>Comience agregando un nuevo técnico</p>
                </div>
            `;
            return;
        }

        empleadosList.innerHTML = tecnicos.map(tecnico => `
                        <style>
                             body {
                                height: 100%;
                            }
                            
                            .overlay {
                                height: 100%;
                            }
                        </style>
            <div class="empleado-item" data-correo="${tecnico.correo}">
                <div class="empleado-info">
                    <h3>${tecnico.nombre} ${tecnico.apellido}</h3>
                    <p><strong>Correo:</strong> ${tecnico.correo}</p>
                    <p><strong>Tipo:</strong> ${tecnico.tipo}</p>
                </div>
                <div class="empleado-actions">
                    <button style="background: red"
                        onclick="eliminarTecnico('${tecnico.correo}')" 
                        aria-label="Eliminar técnico ${tecnico.nombre} ${tecnico.apellido}"
                    >
                        Eliminar
                    </button>
                    <button style="background: green"
                        onclick="prepararEdicion('${tecnico.correo}', '${tecnico.nombre}', '${tecnico.apellido}', '${tecnico.contrasena}', '${tecnico.tipo}')"
                        aria-label="Editar técnico ${tecnico.nombre} ${tecnico.apellido}"
                    >
                        Editar
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        empleadosList.innerHTML = `
            <div class="error" aria-live="assertive">
                Error al cargar técnicos. Intente nuevamente.
            </div>
        `;
    }
}

// Manejador de envío de formulario para crear
async function submitFormHandler(e) {
    e.preventDefault();

    const tecnico = {
        nombre: nombreInput.value.trim(),
        apellido: apellidoInput.value.trim(),
        correo: correoInput.value.trim(),
        contrasena: contrasenaInput.value,
        tipo: tipoInput.value
    };

    const errors = UIUtils.validateForm(tecnico);

    if (errors.length > 0) {
        UIUtils.showMessage(errors.join(' | '));
        return;
    }

    try {
        const response = await TecnicoService.registrarTecnico(tecnico);

        if (response.codigo === 201) {
            UIUtils.showMessage(response.message, 'success');
            UIUtils.resetForm();
            await renderizarTecnicos();
        } else {
            UIUtils.showMessage(response.message || 'Error al registrar técnico');
        }
    } catch (error) {
        UIUtils.showMessage('No se pudo registrar el técnico');
    }
}

// Preparar formulario para edición con más contexto
function prepararEdicion(correo, nombre, apellido, contrasena, tipo) {
    nombreInput.value = nombre;
    apellidoInput.value = apellido;
    correoInput.value = correo;
    contrasenaInput.value = contrasena;
    tipoInput.value = tipo;

    formSubmitButton.textContent = 'Actualizar Técnico';
    form.dataset.modo = 'editar';
    form.dataset.correoOriginal = correo;

    // Mostrar botón de cancelar edición
    if (cancelEditButton) {
        cancelEditButton.style.display = 'block';
    }

    // Remover listener anterior y añadir nuevo para actualización
    form.removeEventListener('submit', submitFormHandler);
    form.addEventListener('submit', updateSubmitHandler);

    // Resaltar elemento en edición
    const empleadoItems = empleadosList.querySelectorAll('.empleado-item');
    empleadoItems.forEach(item => item.classList.remove('editing'));
    const currentItem = empleadosList.querySelector(`[data-correo="${correo}"]`);
    if (currentItem) {
        currentItem.classList.add('editing');
    }
}

// Manejador de actualización con validaciones
async function updateSubmitHandler(e) {
    e.preventDefault();

    const correoOriginal = form.dataset.correoOriginal;
    const tecnico = {
        nombre: nombreInput.value.trim(),
        apellido: apellidoInput.value.trim(),
        correo: correoInput.value.trim(),
        contrasena: contrasenaInput.value,
        tipo: tipoInput.value
    };

    const errors = UIUtils.validateForm(tecnico);

    if (errors.length > 0) {
        UIUtils.showMessage(errors.join(' | '));
        return;
    }

    try {
        const response = await TecnicoService.actualizarTecnico(correoOriginal, tecnico);

        if (response.codigo === 200) {
            UIUtils.showMessage(response.message, 'success');
            UIUtils.resetForm();
            await renderizarTecnicos();
        } else {
            UIUtils.showMessage(response.message || 'Error al actualizar técnico');
        }
    } catch (error) {
        UIUtils.showMessage('No se pudo actualizar el técnico');
    }
}

// Eliminar técnico con confirmación mejorada
async function eliminarTecnico(correo) {
    const confirmacion = confirm('¿Está seguro de eliminar este técnico? Esta acción no se puede deshacer.');

    if (!confirmacion) return;

    try {
        const response = await TecnicoService.eliminarTecnico(correo);

        if (response.codigo === 200) {
            UIUtils.showMessage('Técnico eliminado con éxito', 'success');
            await renderizarTecnicos();
        } else {
            UIUtils.showMessage(response.message || 'Error al eliminar técnico');
        }
    } catch (error) {
        UIUtils.showMessage('No se pudo eliminar el técnico');
    }
}

// Cancelar edición
function cancelarEdicion() {
    UIUtils.resetForm();
    const editingItem = empleadosList.querySelector('.empleado-item.editing');
    if (editingItem) {
        editingItem.classList.remove('editing');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    form.addEventListener('submit', submitFormHandler);

    // Añadir evento de cancelar edición si existe el botón
    const cancelEditButton = document.getElementById('cancelEdit');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', cancelarEdicion);
        cancelEditButton.style.display = 'none'; // Ocultar inicialmente
    }

    renderizarTecnicos();
});