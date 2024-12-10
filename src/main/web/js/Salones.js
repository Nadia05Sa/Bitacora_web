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

// Registrar un nuevo salón
document.getElementById('salonForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!adminRole) {
        showMessage('No tienes permisos para registrar Salones', 'error');
        return;
    }

    const salon = {
        nombre: document.getElementById('nombre').value.trim(),
        ubicacion: document.getElementById('ubicacion').value.trim(),
        capacidad: document.getElementById('capacidad').value.trim(),
    };

    // Desactivar el botón para evitar múltiples envíos
    const submitButton = e.target.querySelector('button');
    submitButton.disabled = true;

    fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al registrar el salón');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.codigo === 201) {
                showMessage('Salón registrado con éxito', 'success');
                document.getElementById('salonForm').reset();
                cargarSalones(); // Recargar lista de salones después de registrar
            } else {
                showMessage(data.message || 'Error al registrar el salón', 'error');
            }
        })
        .catch(error => showMessage(error.message || 'Error al registrar el salón', 'error'))
        .finally(() => {
            submitButton.disabled = false;
        });
});

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
                    div.setAttribute('data-id', salon.id);  // Agregar ID al elemento para actualizarlo
                    div.innerHTML = `
                        <div>
                            <strong>${salon.nombre}</strong>
                            <p>Ubicación: ${salon.ubicacion}</p>
                            <p>Capacidad: ${salon.capacidad}</p>
                            <div class="salon-actions">
                                <button onclick="eliminarSalon(${salon.id})">Eliminar</button>
                                <button onclick="editarSalon(${salon.id})">Editar</button>
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
            cargarSalones(); // Recargar lista de salones después de eliminar
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
            if (data.codigo === 200 && data.data) { // Verifica que la respuesta tenga los datos esperados
                const salon = data.data;
                // Llenar el formulario con los datos actuales del salón
                document.getElementById('nombre').value = salon.nombre;
                document.getElementById('ubicacion').value = salon.ubicacion;
                document.getElementById('capacidad').value = salon.capacidad;

                const form = document.getElementById('salonForm');
                form.querySelector('button').textContent = "Actualizar Salón";

                // Cambiar el comportamiento del formulario para actualizar el salón
                form.onsubmit = function (e) {
                    e.preventDefault();

                    const updatedSalon = {
                        nombre: document.getElementById('nombre').value,
                        ubicacion: document.getElementById('ubicacion').value,
                        capacidad: document.getElementById('capacidad').value,
                    };

                    fetch(`${apiBaseUrl}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedSalon),
                    })
                        .then(response => {
                            if (!response.ok) {
                                return response.json().then(data => {
                                    throw new Error(data.message || 'Error al actualizar el salón');
                                });
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.codigo === 200) {
                                showMessage('Salón actualizado con éxito', 'success');
                                // Actualizar el salón en la lista sin duplicarlo
                                actualizarSalonEnDOM(id, updatedSalon);
                                form.reset();
                                form.querySelector('button').textContent = "Registrar Salón";
                            } else {
                                showMessage(data.message || 'Error al actualizar el salón', 'error');
                            }
                        })
                        .catch(error => showMessage(error.message || 'Error al actualizar el salón', 'error'));
                };
            } else {
                throw new Error(data.message || 'Datos del salón no encontrados');
            }
        })
        .catch(error => showMessage(error.message || 'Error al obtener los datos del salón', 'error'));
}

// Actualizar el salón en el DOM
function actualizarSalonEnDOM(id, updatedSalon) {
    const salonesList = document.getElementById('salonesList');
    const salonItem = salonesList.querySelector(`.salon-item[data-id="${id}"]`);

    if (salonItem) {
        salonItem.querySelector('strong').textContent = updatedSalon.nombre;
        salonItem.querySelector('p:nth-child(2)').textContent = `Ubicación: ${updatedSalon.ubicacion}`;
        salonItem.querySelector('p:nth-child(3)').textContent = `Capacidad: ${updatedSalon.capacidad}`;
    }
}

// Cargar salones al inicio
document.addEventListener('DOMContentLoaded', cargarSalones);
