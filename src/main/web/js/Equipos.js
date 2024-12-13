// Configuración base
const API_BASE_URL = 'http://localhost:8080/v1/equipos';

// Clase de Utilidades para Interfaz de Usuario
class UIUtils {
    // Método mejorado para mostrar mensajes
    static mostrarMensaje(mensaje, tipo = 'error') {
        const messageBox = document.getElementById('message');

        // Limpiar mensajes anteriores
        clearTimeout(this.messageTimeout);

<<<<<<< HEAD:src/main/web/js/Equipos.js
        // Aplicar estilo y mensaje
        messageBox.className = `message ${tipo}`;
        messageBox.textContent = mensaje;
        messageBox.style.display = 'block';

        // Animación de entrada
        requestAnimationFrame(() => {
            messageBox.style.opacity = '1';
            messageBox.style.transform = 'translateY(0)';
        });

        // Ocultar mensaje después de 3 segundos
        this.messageTimeout = setTimeout(() => {
            messageBox.style.opacity = '0';
            messageBox.style.transform = 'translateY(-20px)';

            // Limpiar después de la animación
            setTimeout(() => {
                messageBox.className = '';
                messageBox.textContent = '';
                messageBox.style.display = 'none';
            }, 500);
        }, 3000);
    }

    // Validación de formulario
    static validarFormulario(equipo) {
        const errores = [];

        if (!equipo.marca || equipo.marca.trim().length < 2) {
            errores.push('La marca debe tener al menos 2 caracteres');
        }

        if (!equipo.modelo || equipo.modelo.trim().length < 2) {
            errores.push('El modelo debe tener al menos 2 caracteres');
        }

        if (!equipo.numeroSerie || equipo.numeroSerie.trim().length < 3) {
            errores.push('El número de serie debe tener al menos 3 caracteres');
        }

        return errores;
    }

    // Deshabilitar/Habilitar controles del formulario
    static toggleFormControls(disabled = false) {
        const form = document.getElementById('equipoForm');
        const inputs = form.querySelectorAll('input');
        const submitButton = form.querySelector('button[type="submit"]');

        inputs.forEach(input => {
            input.disabled = disabled;
=======
    const salonIdValue = document.getElementById('salonId').value.trim();
    const equipo = {
        marca: document.getElementById('marca').value.trim(),
        modelo: document.getElementById('modelo').value.trim(),
        numeroSerie: document.getElementById('numeroSerie').value.trim(),
        salonId: parseInt(salonIdValue, 10) // Convertir el salonId a número
    };

    // Validar campos
    if (!equipo.marca || !equipo.modelo || !equipo.numeroSerie || isNaN(equipo.salonId)) {
        mostrarMensaje('Por favor completa todos los campos correctamente.', 'error');
        return;
    }

    const submitButton = e.target.querySelector('button');
    submitButton.disabled = true;

    fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipo),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al registrar el equipo');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.codigo === 201) {
                mostrarMensaje('Equipo registrado con éxito', 'success');
                document.getElementById('equipoForm').reset();
                cargarEquipos();
            } else {
                mostrarMensaje(data.message || 'Error al registrar el equipo', 'error');
            }
        })
        .catch(error => {
            mostrarMensaje(error.message || 'Error al registrar el equipo', 'error');
        })
        .finally(() => {
            submitButton.disabled = false;
>>>>>>> ru:src/main/web/js/Equipos2.js
        });
        submitButton.disabled = disabled;
    }
}

// Servicio para manejar solicitudes a la API
class EquipoService {
    // Método genérico para solicitudes a la API
    static async fetchAPI(url, method = 'GET', body = null) {
        try {
            UIUtils.toggleFormControls(true);

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
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            UIUtils.mostrarMensaje(error.message, 'error');
            throw error;
        } finally {
            UIUtils.toggleFormControls(false);
        }
    }

    // Obtener todos los equipos
    static async obtenerEquipos() {
        try {
            const data = await this.fetchAPI(API_BASE_URL);
            return data.codigo === 200 ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    // Obtener un equipo por ID
    static async obtenerEquipoPorId(id) {
        return this.fetchAPI(`${API_BASE_URL}/${id}`);
    }

    // Registrar nuevo equipo
    static async registrarEquipo(equipo) {
        return this.fetchAPI(API_BASE_URL, 'POST', equipo);
    }

    // Actualizar equipo
    static async actualizarEquipo(id, equipo) {
        return this.fetchAPI(`${API_BASE_URL}/${id}`, 'PUT', equipo);
    }

    // Eliminar equipo
    static async eliminarEquipo(id) {
        return this.fetchAPI(`${API_BASE_URL}/${id}`, 'DELETE');
    }
}

// Gestión de la interfaz de equipos
class EquipoManager {
    // Cargar lista de equipos
    static async cargarEquipos() {
        try {
            const equiposList = document.getElementById('equiposList');
            equiposList.innerHTML = '<div class="loading">Cargando equipos...</div>';

            const equipos = await EquipoService.obtenerEquipos();

            if (equipos.length === 0) {
                equiposList.innerHTML = `
                    <div class="empty-list">
                        <p>No hay equipos disponibles</p>
                        <p>Comience agregando un nuevo equipo</p>
                    </div>
                `;
                return;
            }

            equiposList.innerHTML = equipos.map(equipo => `
                         <style>
                             body {
                                height: 100%;
                            }
                            
                            .overlay {
                                height: 100%;
                            }
                        </style>
                <div class="equipo-item" data-id="${equipo.id}">
                    <div class="equipo-info">
                        <h3>${equipo.marca}</h3>
                        <p><strong>Modelo:</strong> ${equipo.modelo}</p>
                        <p><strong>Número de Serie:</strong> ${equipo.numeroSerie}</p>
                    </div>
                    <div class="equipo-actions">
                        <button style="background: red" onclick="EquipoManager.eliminarEquipo(${equipo.id})" aria-label="Eliminar equipo">
                            Eliminar
                        </button>
                        <button style="background: green" onclick="EquipoManager.prepararEdicion(${equipo.id})" aria-label="Editar equipo">
                            Editar
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            UIUtils.mostrarMensaje('Error al cargar los equipos', 'error');
        }
    }

    // Preparar formulario para edición
    static async prepararEdicion(id) {
        try {
            const form = document.getElementById('equipoForm');
            const submitButton = form.querySelector('button[type="submit"]');

            // Obtener datos del equipo
            const resultado = await EquipoService.obtenerEquipoPorId(id);

            if (resultado.codigo !== 200) {
                throw new Error('No se pudieron obtener los datos del equipo');
            }

            const equipo = resultado.data;

            // Llenar formulario
            document.getElementById('marca').value = equipo.marca;
            document.getElementById('modelo').value = equipo.modelo;
            document.getElementById('numeroSerie').value = equipo.numeroSerie;

            // Cambiar texto del botón
            submitButton.textContent = 'Actualizar Equipo';
            form.dataset.modoEdicion = 'true';
            form.dataset.equipoId = id;

            // Resaltar elemento en edición
            const equipoItems = document.querySelectorAll('.equipo-item');
            equipoItems.forEach(item => item.classList.remove('editing'));
            const currentItem = document.querySelector(`.equipo-item[data-id="${id}"]`);
            if (currentItem) {
                currentItem.classList.add('editing');
            }
        } catch (error) {
            UIUtils.mostrarMensaje('Error al preparar edición', 'error');
        }
    }

    // Eliminar equipo
    static async eliminarEquipo(id) {
        const confirmacion = confirm('¿Está seguro de eliminar este equipo? Esta acción no se puede deshacer.');

        if (!confirmacion) return;

        try {
            const respuesta = await EquipoService.eliminarEquipo(id);

            if (respuesta.codigo === 200) {
                UIUtils.mostrarMensaje('Equipo eliminado con éxito', 'success');
                await this.cargarEquipos();
            } else {
                throw new Error(respuesta.message || 'Error al eliminar el equipo');
            }
        } catch (error) {
            UIUtils.mostrarMensaje(error.message, 'error');
        }
    }

    // Manejar envío de formulario
    static async manejarSubmit(evento) {
        evento.preventDefault();

        const form = evento.target;
        const modoEdicion = form.dataset.modoEdicion === 'true';
        const equipoId = form.dataset.equipoId;

        const equipo = {
            marca: document.getElementById('marca').value.trim(),
            modelo: document.getElementById('modelo').value.trim(),
            numeroSerie: document.getElementById('numeroSerie').value.trim(),
        };

        // Validar formulario
        const errores = UIUtils.validarFormulario(equipo);
        if (errores.length > 0) {
            UIUtils.mostrarMensaje(errores.join(' | '), 'error');
            return;
        }

        try {
            let respuesta;
            if (modoEdicion) {
                respuesta = await EquipoService.actualizarEquipo(equipoId, equipo);
            } else {
                respuesta = await EquipoService.registrarEquipo(equipo);
            }

            if (respuesta.codigo === (modoEdicion ? 200 : 201)) {
                UIUtils.mostrarMensaje(
                    modoEdicion ? 'Equipo actualizado con éxito' : 'Equipo registrado con éxito',
                    'success'
                );

                // Resetear formulario
                form.reset();
                form.removeAttribute('data-modo-edicion');
                form.removeAttribute('data-equipo-id');
                form.querySelector('button[type="submit"]').textContent = 'Registrar Equipo';

                // Quitar resaltado de edición
                const editingItem = document.querySelector('.equipo-item.editing');
                if (editingItem) {
                    editingItem.classList.remove('editing');
                }

                // Recargar lista de equipos
                await this.cargarEquipos();
            } else {
                throw new Error(respuesta.message || 'Error en la operación');
            }
        } catch (error) {
            UIUtils.mostrarMensaje(error.message, 'error');
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('equipoForm');
    form.addEventListener('submit', (evento) => EquipoManager.manejarSubmit(evento));

    // Cargar equipos al inicio
    EquipoManager.cargarEquipos();
});

<<<<<<< HEAD:src/main/web/js/Equipos.js
// Hacer accesible para onclick en HTML
window.EquipoManager = EquipoManager;
=======
// Cargar lista de equipos
function cargarEquipos() {
    fetch(apiBaseUrl)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al cargar la lista de equipos');
                });
            }
            return response.json();
        })
        .then(data => {
            const equiposList = document.getElementById('equiposList');
            equiposList.innerHTML = '';

            if (data.codigo === 200 && Array.isArray(data.data) && data.data.length > 0) {
                data.data.forEach(equipo => {
                    const div = document.createElement('div');
                    div.className = 'equipo-item';
                    div.setAttribute('data-id', equipo.id);
                    div.innerHTML = `
                        <div>
                            <strong>${equipo.marca}</strong>
                            <p>Modelo: ${equipo.modelo}</p>
                            <p>Número de serie: ${equipo.numeroSerie}</p>
                            <div class="equipo-actions">
                                <button onclick="eliminarEquipo(${equipo.id})">Eliminar</button>
                                <button onclick="editarEquipo(${equipo.id})">Editar</button>
                            </div>
                        </div>
                    `;
                    equiposList.appendChild(div);
                });
            } else {
                equiposList.innerHTML = '<p>No hay equipos disponibles.</p>';
            }
        })
        .catch(error => {
            console.error('Error al cargar los equipos:', error);
            mostrarMensaje(error.message || 'Error al cargar la lista de equipos', 'error');
        });
}

// Eliminar un equipo
function eliminarEquipo(id) {
    fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al eliminar el equipo');
                });
            }
            mostrarMensaje('Equipo eliminado con éxito', 'success');
            cargarEquipos(); // Recargar lista de equipos después de eliminar
        })
        .catch(error => mostrarMensaje(error.message || 'Error al eliminar el equipo', 'error'));
}

// Editar un equipo
function editarEquipo(id) {
    fetch(`${apiBaseUrl}/${id}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al obtener los datos del equipo');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.codigo === 200 && data.data) {
                const equipo = data.data;

                // Llenar el formulario con los datos actuales del equipo
                document.getElementById('marca').value = equipo.marca;
                document.getElementById('modelo').value = equipo.modelo;
                document.getElementById('numeroSerie').value = equipo.numeroSerie;
                document.getElementById('salonId').value = equipo.salon.id; // Convertir el salonId a número

                const form = document.getElementById('equipoForm');
                form.querySelector('button').textContent = "Actualizar Equipo";

                // Cambiar el comportamiento del formulario para actualizar el equipo
                form.onsubmit = function (e) {
                    e.preventDefault();

                    const updatedEquipo = {
                        marca: document.getElementById('marca').value.trim(),
                        modelo: document.getElementById('modelo').value.trim(),
                        numeroSerie: document.getElementById('numeroSerie').value.trim(),
                        salonId: parseInt(document.getElementById('salonId').value.trim(), 10) // Convertir el salonId a número
                    };

                    if (!updatedEquipo.marca || !updatedEquipo.modelo || !updatedEquipo.numeroSerie || isNaN(updatedEquipo.salonId)) {
                        mostrarMensaje('Por favor completa todos los campos correctamente.', 'error');
                        return;
                    }

                    const submitButton = e.target.querySelector('button');
                    submitButton.disabled = true;

                    fetch(`${apiBaseUrl}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedEquipo),
                    })
                        .then(response => {
                            if (!response.ok) {
                                return response.json().then(data => {
                                    throw new Error(data.message || 'Error al actualizar el equipo');
                                });
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.codigo === 200) {
                                mostrarMensaje('Equipo actualizado con éxito', 'success');
                                cargarEquipos(); // Recargar lista de equipos después de editar
                                form.reset();
                                form.querySelector('button').textContent = "Registrar Equipo";
                                form.onsubmit = registrarEquipo; // Volver a la función original
                            } else {
                                mostrarMensaje(data.message || 'Error al actualizar el equipo', 'error');
                            }
                        })
                        .catch(error => mostrarMensaje(error.message || 'Error al actualizar el equipo', 'error'))
                        .finally(() => {
                            submitButton.disabled = false;
                        });
                };
            } else {
                throw new Error(data.message || 'Datos del equipo no encontrados');
            }
        })
        .catch(error => mostrarMensaje(error.message || 'Error al obtener los datos del equipo', 'error'));
}

// Cargar equipos al inicio
document.addEventListener('DOMContentLoaded', cargarEquipos);

// Asignar la función de registrar al inicio
document.getElementById('equipoForm').onsubmit = registrarEquipo;
>>>>>>> ru:src/main/web/js/Equipos2.js
