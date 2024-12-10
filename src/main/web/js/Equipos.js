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

    const equipo = {
        marca: document.getElementById('marca').value.trim(),
        modelo: document.getElementById('modelo').value.trim(),
        numeroSerie: document.getElementById('numeroSerie').value.trim(),
    };

    // Verificar si todos los campos están completos
    if (!equipo.marca || !equipo.modelo || !equipo.numeroSerie) {
        mostrarMensaje('Por favor completa todos los campos.', 'error');
        return;
    }

    // Desactivar el botón para evitar múltiples envíos
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
                cargarEquipos(); // Recargar lista de equipos después de registrar
            } else {
                mostrarMensaje(data.message || 'Error al registrar el equipo', 'error');
            }
        })
        .catch(error => mostrarMensaje(error.message || 'Error al registrar el equipo', 'error'))
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
                    div.setAttribute('data-id', equipo.id);  // Agregar ID al elemento para actualizarlo
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
            // Eliminar el equipo en el DOM sin recargar toda la lista
            cargarEquipos();
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
            if (data.codigo === 200 && data.data) { // Verifica que la respuesta tenga los datos esperados
                const equipo = data.data;
                // Llenar el formulario con los datos actuales del equipo
                document.getElementById('marca').value = equipo.marca;
                document.getElementById('modelo').value = equipo.modelo;
                document.getElementById('numeroSerie').value = equipo.numeroSerie;

                const form = document.getElementById('equipoForm');
                form.querySelector('button').textContent = "Actualizar Equipo";

                // Cambiar el comportamiento del formulario para actualizar el equipo
                form.onsubmit = function (e) {
                    e.preventDefault();

                    const updatedEquipo = {
                        marca: document.getElementById('marca').value,
                        modelo: document.getElementById('modelo').value,
                        numeroSerie: document.getElementById('numeroSerie').value,
                    };

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
                                // Actualizar el equipo en el DOM sin recargar toda la lista
                                actualizarEquipoEnDOM(id, updatedEquipo);
                                form.reset();
                                form.querySelector('button').textContent = "Registrar Equipo";
                            } else {
                                mostrarMensaje(data.message || 'Error al actualizar el equipo', 'error');
                            }
                        })
                        .catch(error => mostrarMensaje(error.message || 'Error al actualizar el equipo', 'error'));
                };
            } else {
                throw new Error(data.message || 'Datos del equipo no encontrados');
            }
        })
        .catch(error => mostrarMensaje(error.message || 'Error al obtener los datos del equipo', 'error'));
}

// Actualizar el equipo en el DOM
function actualizarEquipoEnDOM(id, updatedEquipo) {
    const equiposList = document.getElementById('equiposList');
    const equipoItem = equiposList.querySelector(`.equipo-item[data-id="${id}"]`);

    if (equipoItem) {
        equipoItem.querySelector('strong').textContent = updatedEquipo.marca;
        equipoItem.querySelector('p:nth-child(2)').textContent = `Modelo: ${updatedEquipo.modelo}`;
        equipoItem.querySelector('p:nth-child(3)').textContent = `Número de serie: ${updatedEquipo.numeroSerie}`;
    }
}

// Cargar equipos al inicio
document.addEventListener('DOMContentLoaded', cargarEquipos);
