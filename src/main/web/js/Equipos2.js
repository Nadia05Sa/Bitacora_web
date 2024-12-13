const apiBaseUrl = 'http://localhost:8080/v1/equipos';

// Mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    const messageBox = document.getElementById('message');
    messageBox.className = tipo;
    messageBox.textContent = mensaje;
    setTimeout(() => {
        messageBox.className = '';
        messageBox.textContent = '';
    }, 3000);
}

// Registrar un nuevo equipo
document.getElementById('equipoForm').addEventListener('submit', function (e) {
    e.preventDefault();

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
        });
});

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
