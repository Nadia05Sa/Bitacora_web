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

// Utilidades
class UIUtils {
    // Mostrar mensajes con mejor manejo
    static showMessage(message, type = 'error') {
        messageBox.className = `message ${type}`;
        messageBox.textContent = message;
        messageBox.style.display = 'block';

        // Usar animaciones y transiciones
        setTimeout(() => {
            messageBox.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            messageBox.style.opacity = '0';
            setTimeout(() => {
                messageBox.style.display = 'none';
                messageBox.className = '';
                messageBox.textContent = '';
            }, 500);
        }, 3000);
    }

    // Validar campos del formulario
    static validateForm(tecnico) {
        const errors = [];

        if (!tecnico.nombre || tecnico.nombre.length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!tecnico.apellido || tecnico.apellido.length < 2) {
            errors.push('El apellido debe tener al menos 2 caracteres');
        }

        if (!tecnico.correo || !this.isValidEmail(tecnico.correo)) {
            errors.push('Ingrese un correo electrónico válido');
        }

        if (!tecnico.contrasena || tecnico.contrasena.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        if (!tecnico.tipo) {
            errors.push('Seleccione un tipo de técnico');
        }

        return errors;
    }

    // Validar formato de correo electrónico
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Resetear formulario
    static resetForm() {
        form.reset();
        formSubmitButton.textContent = 'Registrar Empleado';
        form.dataset.modo = 'crear';
        form.removeEventListener('submit', updateSubmitHandler);
        form.addEventListener('submit', submitFormHandler);
    }
}

// Servicio de API
class TecnicoService {
    // Método genérico para realizar solicitudes
    static async fetchAPI(url, method = 'GET', body = null) {
        try {
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
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            UIUtils.showMessage(`Error de red: ${error.message}`);
            throw error;
        }
    }

    // Obtener todos los técnicos
    static async obtenerTecnicos() {
        try {
            const data = await this.fetchAPI(API_BASE_URL);

            if (data.codigo !== 200) {
                throw new Error(data.message || 'Error al cargar técnicos');
            }

            return data.data;
        } catch (error) {
            UIUtils.showMessage(error.message);
            return [];
        }
    }

    // Registrar técnico
    static async registrarTecnico(tecnico) {
        return this.fetchAPI(API_BASE_URL, 'POST', tecnico);
    }

    // Actualizar técnico
    static async actualizarTecnico(correoOriginal, tecnico) {
        return this.fetchAPI(`${API_BASE_URL}/${correoOriginal}`, 'PUT', tecnico);
    }

    // Eliminar técnico
    static async eliminarTecnico(correo) {
        return this.fetchAPI(`${API_BASE_URL}/${correo}`, 'DELETE');
    }
}

// Renderizar lista de técnicos
async function renderizarTecnicos() {
    try {
        empleadosList.innerHTML = '<div class="loading">Cargando técnicos...</div>';
        const tecnicos = await TecnicoService.obtenerTecnicos();

        empleadosList.innerHTML = tecnicos.length
            ? tecnicos.map(tecnico => `
                <div class="empleado-item">
                    <div>
                        <strong>${tecnico.nombre} ${tecnico.apellido}</strong>
                        <p><strong>Correo:</strong> ${tecnico.correo}</p>
                        <p><strong>Tipo:</strong> ${tecnico.tipo}</p>
                        <div class="empleado-actions">
                            <button onclick="eliminarTecnico('${tecnico.correo}')">Eliminar</button>
                            <button onclick="prepararEdicion('${tecnico.correo}', '${tecnico.nombre}', '${tecnico.apellido}', '${tecnico.contrasena}', '${tecnico.tipo}')">Editar</button>
                        </div>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-list">No hay técnicos registrados</div>';
    } catch (error) {
        empleadosList.innerHTML = '<div class="error">Error al cargar técnicos</div>';
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
        UIUtils.showMessage(errors.join(', '));
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
        UIUtils.showMessage(error.message);
    }
}

// Preparar formulario para edición
function prepararEdicion(correo, nombre, apellido, contrasena, tipo) {
    nombreInput.value = nombre;
    apellidoInput.value = apellido;
    correoInput.value = correo;
    contrasenaInput.value = contrasena;
    tipoInput.value = tipo;

    formSubmitButton.textContent = 'Actualizar Técnico';
    form.dataset.modo = 'editar';
    form.dataset.correoOriginal = correo;

    // Remover listener anterior y añadir nuevo para actualización
    form.removeEventListener('submit', submitFormHandler);
    form.addEventListener('submit', updateSubmitHandler);
}

// Manejador de actualización
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
        UIUtils.showMessage(errors.join(', '));
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
        UIUtils.showMessage(error.message);
    }
}

// Eliminar técnico
async function eliminarTecnico(correo) {
    if (!confirm('¿Estás seguro de que deseas eliminar a este técnico?')) return;

    try {
        const response = await TecnicoService.eliminarTecnico(correo);

        if (response.codigo === 200) {
            UIUtils.showMessage('Técnico eliminado con éxito', 'success');
            await renderizarTecnicos();
        } else {
            UIUtils.showMessage(response.message || 'Error al eliminar técnico');
        }
    } catch (error) {
        UIUtils.showMessage(error.message);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    form.addEventListener('submit', submitFormHandler);
    renderizarTecnicos();
});