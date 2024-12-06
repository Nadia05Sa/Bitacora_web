const apiBaseUrl = 'http://localhost:8080/v1/equipos';

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

// Registrar un nuevo equipo
document.getElementById('equipoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const equipo = {
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
    };

    fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipo),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.codigo === 201) {
                showMessage('Equipo registrado con éxito', 'success');
                document.getElementById('equipoForm').reset();
                cargarEquipos();
            } else {
                throw new Error(data.message);
            }
        })
        .catch((error) => showMessage(error.message, 'error'));
});

// Cargar lista de equipos
function cargarEquipos() {
    fetch(apiBaseUrl)
        .then((response) => response.json())
        .then((data) => {
            if (data.codigo === 200) {
                const equiposList = document.getElementById('equiposList');
                equiposList.innerHTML = '';
                data.data.forEach((equipo) => {
                    const div = document.createElement('div');
                    div.className = 'equipo-item';
                    div.innerHTML = `
                            <div>
                                <strong>${equipo.marca}</strong>
                                <p>Modelo: ${equipo.modelo}</p>
                                <div class="equipo-actions">
                                    <button onclick="eliminarEquipo(${equipo.id})">Eliminar</button>
                                    <button onclick="editarEquipo(${equipo.id})">Editar</button>
                                </div>
                            </div>
                        `;
                    equiposList.appendChild(div);
                });
            } else {
                throw new Error(data.message);
            }
        })
        .catch((error) => showMessage(error.message, 'error'));
}

// Eliminar un equipo
function eliminarEquipo(id) {
    fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE',
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.codigo === 204) {
                showMessage('Equipo eliminado con éxito', 'success');
                cargarEquipos();
            } else {
                throw new Error(data.message);
            }
        })
        .catch((error) => showMessage(error.message, 'error'));
}

// Editar un equipo
function editarEquipo(id) {
    const equipo = {
        marca: prompt('Nueva marca:'),
        modelo: prompt('Nuevo modelo:'),
    };

    fetch(`${apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipo),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.codigo === 200) {
                showMessage('Equipo actualizado con éxito', 'success');
                cargarEquipos();
            } else {
                throw new Error(data.message);
            }
        })
        .catch((error) => showMessage(error.message, 'error'));
}

// Cargar equipos al inicio
cargarEquipos();
