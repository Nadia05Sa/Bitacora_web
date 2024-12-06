const apiBaseUrl = 'http://localhost:8080/v1/tecnicos'; // URL de la API para los técnicos

// Mostrar mensajes de éxito o error
function showMessage(message, type) {
    const messageBox = document.getElementById('message');
    messageBox.className = type;
    messageBox.textContent = message;
    setTimeout(() => {
        messageBox.className = '';
        messageBox.textContent = '';
    }, 3000);
}

// Registrar un nuevo empleado
document.getElementById('empleadoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const tecnico = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        correo: document.getElementById('correo').value,
        contrasena: document.getElementById('contrasena').value,
        tipo: document.getElementById('tipo').value,
    };

    fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tecnico),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.codigo === 201) {
                showMessage(data.message, 'success');
                document.getElementById('empleadoForm').reset();
                cargarTecnicos();
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch((error) => showMessage('Error al registrar el técnico', 'error'));
});

// Cargar la lista de técnicos
function cargarTecnicos() {
    fetch(apiBaseUrl)
        .then((response) => response.json())
        .then((data) => {
            if (data.codigo === 200) {
                const empleadosList = document.getElementById('empleadosList');
                empleadosList.innerHTML = '';
                data.data.forEach((tecnico) => {
                    const div = document.createElement('div');
                    div.className = 'empleado-item';
                    div.innerHTML = `
                            <div>
                                <strong>${tecnico.nombre} ${tecnico.apellido}</strong>
                                <p>Correo: ${tecnico.correo}</p>
                                <p>Tipo: ${tecnico.tipo}</p>
                                <div class="empleado-actions">
                                    <button onclick="eliminarTecnico(${tecnico.id})">Eliminar</button>
                                    <button onclick="editarTecnico(${tecnico.id})">Editar</button>
                                </div>
                            </div>
                        `;
                    empleadosList.appendChild(div);
                });
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch((error) => showMessage('Error al cargar la lista de técnicos', 'error'));
}

// Eliminar un técnico
function eliminarTecnico(id) {
    fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE',
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.codigo === 204) {
                showMessage('Técnico eliminado con éxito', 'success');
                cargarTecnicos();
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch((error) => showMessage('Error al eliminar el técnico', 'error'));
}

// Editar un técnico
function editarTecnico(id) {
    const tecnico = {
        nombre: prompt('Nombre:'),
        apellido: prompt('Apellido:'),
        correo: prompt('Correo:'),
        contrasena: prompt('Contraseña:'),
        tipo: prompt('Tipo (Tecnico/AdminBitacora):'),
    };

    fetch(`${apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tecnico),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.codigo === 200) {
                showMessage(data.message, 'success');
                cargarTecnicos();
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch((error) => showMessage('Error al actualizar el técnico', 'error'));
}

// Cargar la lista de técnicos al inicio
cargarTecnicos();