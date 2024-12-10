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
        numeroSerie: document.getElementById('numeroSerie').value
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
                            <p>Número de Serie: ${equipo.numeroSerie}</p>
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
        .then((response) => {
            if (response.status === 204) {
                showMessage('Equipo eliminado con éxito', 'success');
                cargarEquipos();
            } else {
                return response.json().then((data) => { throw new Error(data.message); });
            }
        })
        .catch((error) => showMessage(error.message, 'error'));
}

// Función para abrir el modal de edición con los datos del equipo
function editarEquipo(id) {
    if (!isAdmin()) {
        showMessage('Acceso denegado. Solo los administradores pueden editar equipos.', 'error');
        return;
    }

    // Obtener los datos del equipo seleccionado
    fetch(`${apiBaseUrl}/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.codigo === 200) {
                document.getElementById('editEquipoId').value = id;
                document.getElementById('editMarca').value = data.data.marca;
                document.getElementById('editModelo').value = data.data.modelo;
                document.getElementById('editNumeroSerie').value = data.data.numeroSerie;

                // Mostrar el modal
                document.getElementById('editEquipoModal').style.display = 'block';
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => showMessage(error.message, 'error'));
}

// Cerrar el modal de edición
function closeEditModal() {
    document.getElementById('editEquipoModal').style.display = 'none';
}

// Manejar el envío del formulario de edición
document.getElementById('editEquipoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('editEquipoId').value;
    const equipo = {
        marca: document.getElementById('editMarca').value,
        modelo: document.getElementById('editModelo').value,
        numeroSerie: document.getElementById('editNumeroSerie').value
    };

    fetch(`${apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipo),
    })
        .then(response => response.json())
        .then(data => {
            if (data.codigo === 200) {
                showMessage('Equipo actualizado con éxito', 'success');
                closeEditModal();
                cargarEquipos();
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => showMessage(error.message, 'error'));
});

// Cargar equipos al inicio
cargarEquipos();
