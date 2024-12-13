const apiBaseUrl = 'http://localhost:8080/v1/salones';

// Mostrar mensajes
function showMessage(message, type) {
    const messageBox = document.getElementById('message');
    messageBox.className = type;
    messageBox.textContent = message;
    setTimeout(() => {
        messageBox.className = '';
        messageBox.textContent = '';
    }, 3000);
}

// Variable para rastrear el modo de edición
let editingId = null;

// Registrar un nuevo salón o actualizar uno existente
document.getElementById('salonForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const salon = {
        nombre: document.getElementById('nombre').value.trim(),
        ubicacion: document.getElementById('ubicacion').value.trim(),
        capacidad: document.getElementById('capacidad').value.trim(),
    };

    // Desactivar el botón para evitar múltiples envíos
    const submitButton = e.target.querySelector('button');
    submitButton.disabled = true;

    // Determinar si es una actualización o un nuevo registro
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${apiBaseUrl}/${editingId}` : apiBaseUrl;

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || (editingId ? 'Error al actualizar el salón' : 'Error al registrar el salón'));
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.codigo === 200 || data.codigo === 201) {
                const message = editingId ? 'Salón actualizado con éxito' : 'Salón registrado con éxito';
                showMessage(message, 'success');

                // Resetear formulario y estado de edición
                document.getElementById('salonForm').reset();
                resetFormToCreateMode();

                // Recargar lista de salones
                cargarSalones();
            } else {
                showMessage(data.message || 'Error en la operación', 'error');
            }
        })
        .catch(error => showMessage(error.message, 'error'))
        .finally(() => {
            submitButton.disabled = false;
        });
});

// Restablecer el formulario al modo de creación
function resetFormToCreateMode() {
    const form = document.getElementById('salonForm');
    form.querySelector('button').textContent = "Registrar Salón";
    editingId = null;
}

// Cargar lista de salones
function cargarSalones() {
    fetch(apiBaseUrl)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al cargar la lista de salones');
                });
            }
            return response.json();
        })
        .then(data => {
            const salonesList = document.getElementById('salonesList');
            salonesList.innerHTML = '';

            if (data.codigo === 200 && Array.isArray(data.data) && data.data.length > 0) {
                data.data.forEach(salon => {
                    const div = document.createElement('div');
                    div.className = 'salon-item';
                    div.setAttribute('data-id', salon.id);
                    div.innerHTML = `
                        <style>
                             body {
                                height: 100%;
                            }
                            
                            .overlay {
                                height: 100%;
                            }
                        </style>
                        <div>
                            <strong>${salon.nombre}</strong>
                            <p>Ubicación: ${salon.ubicacion}</p>
                            <p>Capacidad: ${salon.capacidad}</p>
                            <div class="salon-actions">
                                <button class="eliminar" onclick="eliminarSalon(${salon.id})">Eliminar</button>
                                <button class="editar" onclick="editarSalon(${salon.id})">Editar</button>
                            </div>
                        </div>
                    `;
                    salonesList.appendChild(div);
                });
            } else {
                salonesList.innerHTML = '<p>No hay salones disponibles.</p>';
            }
        })
        .catch(error => {
            console.error('Error al cargar los salones:', error);
            showMessage(error.message || 'Error al cargar la lista de salones', 'error');
        });
}

// Eliminar un salón
function eliminarSalon(id) {
    fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al eliminar el salón');
                });
            }
            showMessage('Salón eliminado con éxito', 'success');
            cargarSalones();
        })
        .catch(error => showMessage(error.message || 'Error al eliminar el salón', 'error'));
}

// Editar un salón
function editarSalon(id) {
    fetch(`${apiBaseUrl}/${id}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al obtener los datos del salón');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.codigo === 200 && data.data) {
                const salon = data.data;
                // Llenar el formulario con los datos actuales del salón
                document.getElementById('nombre').value = salon.nombre;
                document.getElementById('ubicacion').value = salon.ubicacion;
                document.getElementById('capacidad').value = salon.capacidad;

                // Establecer el ID de edición y cambiar el texto del botón
                editingId = id;
                const form = document.getElementById('salonForm');
                form.querySelector('button').textContent = "Actualizar Salón";
            } else {
                throw new Error(data.message || 'Datos del salón no encontrados');
            }
        })
        .catch(error => showMessage(error.message || 'Error al obtener los datos del salón', 'error'));
}

// Cargar salones al inicio
document.addEventListener('DOMContentLoaded', cargarSalones);