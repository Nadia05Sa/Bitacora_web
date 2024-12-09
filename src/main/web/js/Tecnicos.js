const apiBaseUrl = 'http://localhost:8080/v1/tecnicos'; // URL de la API para los técnicos

// Mostrar mensajes de éxito o error
function showMessage(message, type) {
    const messageBox = document.getElementById('message');
    messageBox.className = type; // 'error' o 'success'
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
                            <p><strong>Correo:</strong> ${tecnico.correo}</p>
                            <p><strong>Tipo:</strong> ${tecnico.tipo}</p>
                            <div class="empleado-actions">
                                <button onclick="eliminarTecnico('${tecnico.correo}')">Eliminar</button>
                                <button onclick="editarTecnico('${tecnico.correo}', '${tecnico.nombre}', '${tecnico.apellido}', '${tecnico.correo}', '${tecnico.contrasena}', '${tecnico.tipo}')">Editar</button>
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
function eliminarTecnico(correo) {
    fetch(`${apiBaseUrl}/${correo}`, {
        method: 'DELETE',
    })
        .then((response) => {
            if (response.ok) {
                showMessage('Técnico eliminado con éxito', 'success');
                // Recargar la página para que ya no aparezca el técnico eliminado
                location.reload();
            } else {
                throw new Error('Error al eliminar el técnico');
            }
        })
        .catch((error) => {
            showMessage(error.message, 'error');
        });
}


// Editar un técnico
function editarTecnico(correoOriginal, nombre, apellido, correo, contrasena, tipo) {
    // Llenar el formulario con los datos actuales del técnico
    document.getElementById('nombre').value = nombre;
    document.getElementById('apellido').value = apellido;
    document.getElementById('correo').value = correoOriginal;
    document.getElementById('contrasena').value = contrasena;
    document.getElementById('tipo').value = tipo;

    // Cambiar el comportamiento del formulario para actualizar el técnico
    const form = document.getElementById('empleadoForm');
    // Cambiar el texto del botón del formulario a "Actualizar"
    form.querySelector('button').textContent = "Actualizar Técnico";

    // Prevenir que se agregue un nuevo técnico, y usar el mismo evento para actualizar el técnico
    form.removeEventListener('submit', submitFormHandler);
    form.addEventListener('submit', function updateSubmitHandler(e) {
        e.preventDefault();

        const tecnico = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            correo: document.getElementById('correo').value,
            contrasena: document.getElementById('contrasena').value,
            tipo: document.getElementById('tipo').value,
        };

        // La URL debe incluir el correoOriginal directamente
        fetch(`${apiBaseUrl}/${correoOriginal}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tecnico),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Error ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then((response) => {
                if (response.codigo === 200) {
                    showMessage(response.message, 'success');
                    cargarTecnicos(); // Recargar la lista de técnicos después de la actualización
                    form.reset();
                    form.querySelector('button').textContent = "Registrar Empleado";
                    form.removeEventListener('submit', updateSubmitHandler);
                    form.addEventListener('submit', submitFormHandler);
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
    });
}




// Función para registrar un nuevo empleado
function submitFormHandler(e) {
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
}

// Cargar la lista de técnicos al inicio
cargarTecnicos();
