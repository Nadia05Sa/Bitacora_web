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

    const salon = {
        nombre: document.getElementById('nombre').value,
        ubicacion: document.getElementById('ubicacion').value,
        capacidad: document.getElementById('capacidad').value,
    };

    fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon),
    })
        .then((response) => response.json()) // Convertir la respuesta a JSON
        .then((data) => {
            if (data.codigo === 201) {
                showMessage('Salón registrado con éxito', 'success');
                document.getElementById('salonForm').reset();
                cargarSalones(); // Recargar lista de salones después de registrar
            } else {
                showMessage(data.message || 'Error al registrar el salón', 'error');
            }
        })
        .catch((error) => showMessage(error.message, 'error'));
});

// Cargar lista de salones
function cargarSalones() {
    fetch(apiBaseUrl)
        .then((response) => response.json()) // Convertir la respuesta a JSON
        .then((data) => {
            console.log('Respuesta de la API:', data); // Verificar la respuesta
            const salonesList = document.getElementById('salonesList');
            salonesList.innerHTML = ''; // Limpiar la lista actual

            if (data.codigo === 200 && Array.isArray(data.data) && data.data.length > 0) {
                // Solo agregar salones si hay datos en el array
                data.data.forEach((salon) => {
                    const div = document.createElement('div');
                    div.className = 'salon-item';
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
        .catch((error) => {
            console.error('Error al cargar los salones:', error);
            showMessage(error.message || 'Error al cargar la lista de salones', 'error');
        });
}

// Eliminar un salón
function eliminarSalon(id) {
    fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE',
    })
        .then((response) => response.json()) // Convertir la respuesta a JSON
        .then((data) => {
            if (data.codigo === 204) {
                showMessage('Salón eliminado con éxito', 'success');
                cargarSalones(); // Recargar lista de salones después de eliminar
            } else {
                showMessage(data.message || 'Error al eliminar el salón', 'error');
            }
        })
        .catch((error) => showMessage(error.message || 'Error al eliminar el salón', 'error'));
}

// Editar un salón
function editarSalon(id) {
    const salon = {
        nombre: prompt('Nombre:'),
        ubicacion: prompt('Ubicación:'),
        capacidad: prompt('Capacidad:'),
    };

    fetch(`${apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon),
    })
        .then((response) => response.json()) // Convertir la respuesta a JSON
        .then((data) => {
            if (data.codigo === 200) {
                showMessage('Salón actualizado con éxito', 'success');
                cargarSalones(); // Recargar lista de salones después de editar
            } else {
                showMessage(data.message || 'Error al actualizar el salón', 'error');
            }
        })
        .catch((error) => showMessage(error.message || 'Error al actualizar el salón', 'error'));
}

// Cargar salones al inicio
document.addEventListener('DOMContentLoaded', cargarSalones);
