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

// Verificar si el usuario tiene rol de admin
function isAdmin() {
    const token = localStorage.getItem('authToken'); // O usa sessionStorage si corresponde
    if (!token) {
        return false;
    }

    // Decodificar el token para obtener el rol (esto depende del tipo de token y cómo esté estructurado)
    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodificar JWT (si es el caso)
        return decodedToken.role === 'admin'; // Verificar si el rol es 'admin'
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return false;
    }
}

// Registrar un nuevo equipo (solo si es admin)
document.getElementById('equipoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!isAdmin()) {
        showMessage('Acceso denegado. Solo los administradores pueden registrar equipos.', 'error');
        return;
    }

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
                                    ${isAdmin() ? `
                                        <button onclick="eliminarEquipo(${equipo.id})">Eliminar</button>
                                        <button onclick="editarEquipo(${equipo.id})">Editar</button>
                                    ` : ''}
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

// Eliminar un equipo (solo si es admin)
function eliminarEquipo(id) {
    if (!isAdmin()) {
        showMessage('Acceso denegado. Solo los administradores pueden eliminar equipos.', 'error');
        return;
    }

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

// Editar un equipo (solo si es admin)
function editarEquipo(id) {
    if (!isAdmin()) {
        showMessage('Acceso denegado. Solo los administradores pueden editar equipos.', 'error');
        return;
    }

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
